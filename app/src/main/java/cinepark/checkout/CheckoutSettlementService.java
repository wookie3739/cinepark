package cinepark.checkout;

import cinepark.catalog.CartService;
import cinepark.catalog.CouponCode;
import cinepark.catalog.CouponCodeRepository;
import cinepark.catalog.CouponCodeStatus;
import cinepark.checkout.dto.CheckoutConfirmResponse;
import cinepark.checkout.dto.ConfirmIssuedLineResponse;
import cinepark.common.BusinessException;
import cinepark.order.ShopOrder;
import cinepark.order.ShopOrderRepository;
import cinepark.toss.TossPaymentApproved;
import cinepark.toss.TossPaymentsApiClient;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NavigableMap;
import java.util.TreeMap;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class CheckoutSettlementService {

    private final PaymentCheckoutRepository paymentCheckoutRepository;
    private final ShopOrderRepository shopOrderRepository;
    private final CouponCodeRepository couponCodeRepository;
    private final CartService cartService;
    private final TossPaymentsApiClient tossPaymentsApiClient;

    @Transactional(readOnly = true)
    public CheckoutConfirmResponse paidOrderSnapshot(long shopOrderId) {
        ShopOrder shop =
                shopOrderRepository
                        .findById(shopOrderId)
                        .orElseThrow(() -> BusinessException.notFound("주문을 찾을 수 없습니다."));
        return buildConfirmResponseFromShopOrder(shop);
    }

    @Transactional(readOnly = true)
    public CheckoutConfirmResponse toCheckoutConfirmResponse(ShopOrder shop) {
        return buildConfirmResponseFromShopOrder(shop);
    }

    @Transactional(readOnly = true)
    public CheckoutConfirmResponse paidOrderSnapshotForBuyer(long shopOrderId, Long userId) {
        ShopOrder shop =
                shopOrderRepository
                        .findById(shopOrderId)
                        .orElseThrow(() -> BusinessException.notFound("주문을 찾을 수 없습니다."));
        if (userId == null || shop.getUserId() == null || !Objects.equals(shop.getUserId(), userId)) {
            throw BusinessException.forbidden("다른 회원의 주문입니다.");
        }
        return buildConfirmResponseFromShopOrder(shop);
    }

    @Transactional
    public CheckoutConfirmResponse completePaymentAfterToss(
            Long userId, TossPaymentApproved toss, String clientPaymentKey) {
        PaymentCheckout checkout =
                paymentCheckoutRepository
                        .lockByMerchantOrderIdAndUserId(toss.orderId(), userId)
                        .orElseThrow(() -> BusinessException.notFound("결제 시도를 찾을 수 없습니다."));

        expireIfStale(checkout);
        paymentCheckoutRepository.save(checkout);

        if (checkout.getStatus() == PaymentCheckoutStatus.PAID && checkout.getShopOrderId() != null) {
            return paidOrderSnapshot(checkout.getShopOrderId());
        }

        if (checkout.getStatus() == PaymentCheckoutStatus.EXPIRED) {
            tossPaymentsApiClient.cancelPaymentQuietly(clientPaymentKey, "결제 준비 만료");
            throw BusinessException.of(HttpStatus.GONE, "결제 준비가 만료되었습니다.", "CHECKOUT_EXPIRED");
        }
        if (checkout.getStatus() == PaymentCheckoutStatus.ABANDONED) {
            tossPaymentsApiClient.cancelPaymentQuietly(clientPaymentKey, "결제 시도 중단됨");
            throw BusinessException.of(
                    HttpStatus.CONFLICT, "취소된 결제 시도입니다.", "CHECKOUT_ABANDONED");
        }
        if (checkout.getStatus() != PaymentCheckoutStatus.PENDING) {
            tossPaymentsApiClient.cancelPaymentQuietly(clientPaymentKey, "결제 시도 상태 오류");
            throw BusinessException.of(HttpStatus.CONFLICT, "결제를 완료할 수 없습니다.", "CHECKOUT_INVALID_STATE");
        }

        if (checkout.getTotalAmount() != toss.totalAmount()) {
            tossPaymentsApiClient.cancelPaymentQuietly(clientPaymentKey, "금액 불일치");
            throw BusinessException.of(HttpStatus.BAD_REQUEST, "금액이 일치하지 않습니다.", "PAYMENT_AMOUNT_MISMATCH");
        }
        if (!toss.paymentKey().equals(clientPaymentKey)) {
            tossPaymentsApiClient.cancelPaymentQuietly(clientPaymentKey, "키 불일치");
            throw BusinessException.badRequest("결제 키가 일치하지 않습니다.");
        }
        Instant now = Instant.now();
        ShopOrder shopOrder =
                shopOrderRepository.save(
                        ShopOrder.builder()
                                .totalAmount(checkout.getTotalAmount())
                                .paidAt(now)
                                .userId(userId)
                                .merchantOrderId(checkout.getMerchantOrderId())
                                .tossPaymentKey(toss.paymentKey())
                                .receiptUrl(toss.receiptUrl())
                                .build());

        allocateCouponCodes(checkout, shopOrder.getId(), userId, now);

        checkout.setShopOrderId(shopOrder.getId());
        checkout.setStatus(PaymentCheckoutStatus.PAID);
        checkout.setPaidAt(now);
        checkout.setTossPaymentKey(toss.paymentKey());
        checkout.setReceiptUrl(toss.receiptUrl());
        paymentCheckoutRepository.save(checkout);

        Map<String, Integer> purchasedByCode = new LinkedHashMap<>();
        for (PaymentCheckoutLine line : checkout.getLines()) {
            purchasedByCode.merge(line.getProductCode(), line.getQuantity(), Integer::sum);
        }
        cartService.decrementQuantitiesForOrder(userId, purchasedByCode);
        log.info("checkout finalized merchantOrderId={} shopOrderId={}", checkout.getMerchantOrderId(), shopOrder.getId());

        return buildConfirmResponseFromShopOrder(shopOrder, toss.receiptUrl());
    }

    private void allocateCouponCodes(PaymentCheckout checkout, long shopOrderId, Long userId, Instant now) {
        List<PaymentCheckoutLine> lines = new ArrayList<>(checkout.getLines());
        lines.sort(Comparator.comparingInt(PaymentCheckoutLine::getLineIndex));

        for (PaymentCheckoutLine line : lines) {
            Long productDbId = line.getCouponProduct().getId();
            List<CouponCode> picked =
                    couponCodeRepository.lockAvailableForProductLimited(
                            productDbId,
                            CouponCodeStatus.AVAILABLE,
                            PageRequest.of(0, line.getQuantity()));

            if (picked.size() < line.getQuantity()) {
                throw BusinessException.of(
                        HttpStatus.CONFLICT,
                        "쿠폰 번호 재고가 부족합니다. 다른 고객이 먼저 구매했을 수 있습니다.",
                        "COUPON_POOL_EMPTY");
            }

            for (CouponCode code : picked) {
                code.setStatus(CouponCodeStatus.USED);
                code.setIssuedToUserId(userId);
                code.setOrderId(shopOrderId);
                code.setOrderLineId((long) line.getLineIndex());
                code.setIssuedAt(now);
                couponCodeRepository.save(code);
            }
        }
    }

    private CheckoutConfirmResponse buildConfirmResponseFromShopOrder(ShopOrder shop) {
        return buildConfirmResponseFromShopOrder(shop, null);
    }

    private CheckoutConfirmResponse buildConfirmResponseFromShopOrder(ShopOrder shop, String receiptUrlFromPg) {
        List<CouponCode> codes =
                couponCodeRepository.findByOrderIdOrderByOrderLineIdAscIdAsc(shop.getId());
        NavigableMap<Long, List<CouponCode>> byLine =
                codes.stream().collect(Collectors.groupingBy(CouponCode::getOrderLineId, TreeMap::new, Collectors.toList()));

        List<ConfirmIssuedLineResponse> lines = new ArrayList<>();
        for (var entry : byLine.entrySet()) {
            List<CouponCode> slice = entry.getValue();
            if (slice.isEmpty()) {
                continue;
            }
            CouponCode head = slice.get(0);
            String productCode = head.getCouponProduct().getProductCode();
            String productName = head.getCouponProduct().getName();
            int qty = slice.size();
            lines.add(
                    new ConfirmIssuedLineResponse(
                            productCode, productName, qty, credentialsForBuyer(slice)));
        }

        String receiptUrl = pickReceiptUrlForApi(receiptUrlFromPg, shop.getReceiptUrl());

        return new CheckoutConfirmResponse(
                shop.getId(),
                shop.getMerchantOrderId() != null ? shop.getMerchantOrderId() : "",
                receiptUrl,
                lines);
    }

    private static String pickReceiptUrlForApi(String fromPg, String fromEntity) {
        if (StringUtils.hasText(fromPg)) {
            return fromPg.trim();
        }
        if (StringUtils.hasText(fromEntity)) {
            return fromEntity.trim();
        }
        return null;
    }

    /** 결제 확정 직후 본인 주문 응답: 구매자에게 실제 쿠폰 번호를 내려준다(이 엔드포인트는 로그인·본인 검증 하에만 호출된다). */
    private static List<String> credentialsForBuyer(List<CouponCode> codes) {
        return codes.stream()
                .map(c -> c.getCredential() != null ? c.getCredential() : "")
                .toList();
    }

    private void expireIfStale(PaymentCheckout checkout) {
        if (checkout.getStatus() != PaymentCheckoutStatus.PENDING) {
            return;
        }
        if (Instant.now().isAfter(checkout.getExpiresAt())) {
            checkout.setStatus(PaymentCheckoutStatus.EXPIRED);
        }
    }
}
