package cinepark.checkout;

import cinepark.catalog.CartLine;
import cinepark.catalog.CartLineRepository;
import cinepark.catalog.CouponCodeRepository;
import cinepark.catalog.CouponCodeStatus;
import cinepark.catalog.CouponProduct;
import cinepark.catalog.CouponProductRepository;
import cinepark.catalog.CouponShelfStatus;
import cinepark.checkout.dto.AbandonCheckoutResponseBody;
import cinepark.checkout.dto.CheckoutPrepareLineRequest;
import cinepark.checkout.dto.CheckoutPrepareRequestBody;
import cinepark.checkout.dto.CheckoutPrepareResponse;
import cinepark.common.BusinessException;
import cinepark.toss.TossPaymentsProperties;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CheckoutDraftService {

    private final PaymentCheckoutRepository paymentCheckoutRepository;
    private final CartLineRepository cartLineRepository;
    private final CouponProductRepository couponProductRepository;
    private final CouponCodeRepository couponCodeRepository;
    private final TossPaymentsProperties tossPaymentsProperties;

    private record ProductQty(CouponProduct product, int quantity) {}

    /** confirm 직전 토스 호출 안에서 사용 — 만료 상태만 정리해서 반환 */
    @Transactional
    public PaymentCheckout loadCheckoutForDecision(String merchantOrderId, Long userId) {
        PaymentCheckout checkout =
                paymentCheckoutRepository
                        .findByMerchantOrderIdAndUserId(merchantOrderId, userId)
                        .orElseThrow(() -> BusinessException.notFound("결제 시도를 찾을 수 없습니다."));
        expireIfStale(checkout);
        return paymentCheckoutRepository.save(checkout);
    }

    @Transactional
    public CheckoutPrepareResponse prepare(Long userId, CheckoutPrepareRequestBody body) {
        if (body != null && body.cartRevision() != null && !body.cartRevision().isBlank()) {
            // 낙관적 락용 확장 가능
        }

        for (PaymentCheckout pending :
                paymentCheckoutRepository.findAllByUserIdAndStatus(userId, PaymentCheckoutStatus.PENDING)) {
            pending.setStatus(PaymentCheckoutStatus.ABANDONED);
        }

        List<ProductQty> productLines = resolveProductLines(userId, body);
        if (productLines.isEmpty()) {
            throw BusinessException.of(HttpStatus.BAD_REQUEST, "결제할 상품이 없습니다.", "CART_EMPTY");
        }

        long totalAmount = 0;
        Instant expiresAt =
                Instant.now().plus(Duration.ofMinutes(tossPaymentsProperties.getPrepareTtlMinutes()));

        String merchantOrderId = "cp_" + UUID.randomUUID().toString().replace("-", "");
        PaymentCheckout checkout =
                PaymentCheckout.builder()
                        .merchantOrderId(merchantOrderId)
                        .userId(userId)
                        .totalAmount(0)
                        .expiresAt(expiresAt)
                        .status(PaymentCheckoutStatus.PENDING)
                        .build();

        int lineIdx = 1;
        for (ProductQty pq : productLines) {
            CouponProduct product = pq.product();
            int qty = pq.quantity();
            validateOnShelf(product);

            long available =
                    couponCodeRepository.countByCouponProduct_IdAndStatus(
                            product.getId(), CouponCodeStatus.AVAILABLE);
            if (available < qty) {
                throw BusinessException.of(HttpStatus.BAD_REQUEST, "재고가 부족합니다.", "INSUFFICIENT_STOCK");
            }

            totalAmount += (long) product.getUnitPrice() * qty;
            PaymentCheckoutLine line =
                    PaymentCheckoutLine.builder()
                            .couponProduct(product)
                            .productCode(product.getProductCode())
                            .productName(product.getName())
                            .unitPrice(product.getUnitPrice())
                            .quantity(qty)
                            .lineIndex(lineIdx++)
                            .build();
            checkout.addLine(line);
        }

        checkout.setTotalAmount(totalAmount);

        CouponProduct head = productLines.get(0).product();
        String orderName;
        if (productLines.size() == 1) {
            orderName = head.getName();
        } else {
            orderName = head.getBrandLabel() + " " + truncate(head.getName(), 40) + " 외 "
                    + (productLines.size() - 1) + "건";
        }
        if (orderName.length() > 230) {
            orderName = orderName.substring(0, 227) + "...";
        }
        checkout.setOrderName(orderName);

        paymentCheckoutRepository.save(checkout);

        return new CheckoutPrepareResponse(
                merchantOrderId, totalAmount, "user_" + userId, expiresAt, orderName);
    }

    /** 요청에 lines 가 있으면(비어 있지 않으면) 그걸 우선 — 없으면 서버 장바구니 */
    private List<ProductQty> resolveProductLines(Long userId, CheckoutPrepareRequestBody body) {
        if (body != null && body.lines() != null && !body.lines().isEmpty()) {
            return resolveFromRequestLines(body.lines());
        }
        return resolveFromServerCart(userId);
    }

    private List<ProductQty> resolveFromRequestLines(List<CheckoutPrepareLineRequest> raw) {
        LinkedHashMap<String, Integer> merged = new LinkedHashMap<>();
        for (CheckoutPrepareLineRequest r : raw) {
            if (r.productCode() == null) {
                continue;
            }
            String code = r.productCode().trim();
            if (code.isEmpty()) {
                continue;
            }
            int q = r.quantity();
            if (q < 1 || q > 99) {
                throw BusinessException.of(HttpStatus.BAD_REQUEST, "수량이 올바르지 않습니다.", "INVALID_QUANTITY");
            }
            merged.merge(code, q, Integer::sum);
        }
        if (merged.isEmpty()) {
            return List.of();
        }
        List<ProductQty> out = new ArrayList<>();
        for (Map.Entry<String, Integer> e : merged.entrySet()) {
            int qty = Math.min(99, e.getValue());
            if (qty < 1) {
                continue;
            }
            CouponProduct product =
                    couponProductRepository
                            .findByProductCode(e.getKey())
                            .orElseThrow(() -> BusinessException.notFound("상품을 찾을 수 없습니다."));
            out.add(new ProductQty(product, qty));
        }
        return out;
    }

    private List<ProductQty> resolveFromServerCart(Long userId) {
        List<CartLine> cartLines = cartLineRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        List<ProductQty> out = new ArrayList<>();
        for (CartLine cartLine : cartLines) {
            CouponProduct product = loadProduct(cartLine);
            out.add(new ProductQty(product, cartLine.getQuantity()));
        }
        return out;
    }

    private CouponProduct loadProduct(CartLine cartLine) {
        return couponProductRepository
                .findById(cartLine.getCouponProduct().getId())
                .orElseThrow(() -> BusinessException.notFound("상품을 찾을 수 없습니다."));
    }

    private static String truncate(String name, int max) {
        if (name == null) {
            return "";
        }
        return name.length() <= max ? name : name.substring(0, max) + "…";
    }

    private static void validateOnShelf(CouponProduct product) {
        if (product.getShelfStatus() != CouponShelfStatus.ON_SALE) {
            throw BusinessException.of(HttpStatus.BAD_REQUEST, "판매 중인 상품만 결제할 수 있습니다.", "NOT_ON_SALE");
        }
    }

    @Transactional
    public AbandonCheckoutResponseBody abandon(Long userId, String merchantOrderId) {
        PaymentCheckout checkout =
                paymentCheckoutRepository
                        .findByMerchantOrderIdAndUserId(merchantOrderId, userId)
                        .orElseThrow(() -> BusinessException.notFound("결제 시도를 찾을 수 없습니다."));
        expireIfStale(checkout);
        if (checkout.getStatus() == PaymentCheckoutStatus.PAID) {
            throw BusinessException.of(HttpStatus.CONFLICT, "이미 결제가 완료된 주문입니다.", "CHECKOUT_ALREADY_PAID");
        }
        if (checkout.getStatus() != PaymentCheckoutStatus.PENDING) {
            throw BusinessException.of(HttpStatus.CONFLICT, "취소할 수 있는 결제 대기 상태가 아닙니다.", "CHECKOUT_NOT_PENDING");
        }
        checkout.setStatus(PaymentCheckoutStatus.ABANDONED);
        paymentCheckoutRepository.save(checkout);
        return new AbandonCheckoutResponseBody("ABANDONED");
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
