package cinepark.order;

import cinepark.catalog.CouponCodeRepository;
import cinepark.checkout.CheckoutSettlementService;
import cinepark.common.BusinessException;
import cinepark.checkout.dto.CheckoutConfirmResponse;
import cinepark.order.dto.AdminOrderDetailResponse;
import cinepark.order.dto.AdminOrderRowResponse;
import cinepark.user.User;
import cinepark.user.UserRepository;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AdminShopOrderService {

    private static final String STATUS_PAID = "PAID";

    private final ShopOrderRepository shopOrderRepository;
    private final UserRepository userRepository;
    private final CouponCodeRepository couponCodeRepository;
    private final CheckoutSettlementService checkoutSettlementService;

    @Transactional(readOnly = true)
    public Page<AdminOrderRowResponse> list(String keyword, Pageable pageable) {
        String q = StringUtils.hasText(keyword) ? keyword : null;
        Page<ShopOrder> page =
                shopOrderRepository.findAll(
                        AdminShopOrders.searchSpec(Optional.ofNullable(q).orElse("")), pageable);
        List<Long> orderIds =
                page.getContent().stream().map(ShopOrder::getId).filter(Objects::nonNull).toList();
        Map<Long, Long> couponCounts = loadCouponCounts(orderIds);
        Set<Long> buyerIds =
                page.getContent().stream()
                        .map(ShopOrder::getUserId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());
        Map<Long, User> buyersById =
                buyerIds.isEmpty()
                        ? Map.of()
                        : userRepository.findAllById(buyerIds).stream()
                                .collect(Collectors.toMap(User::getId, u -> u));
        return page.map(
                o ->
                        new AdminOrderRowResponse(
                                o.getId(),
                                o.getMerchantOrderId() != null ? o.getMerchantOrderId() : "",
                                o.getTossPaymentKey() != null ? o.getTossPaymentKey() : "",
                                o.getUserId(),
                                Optional.ofNullable(o.getUserId())
                                        .flatMap(uid -> Optional.ofNullable(buyersById.get(uid)))
                                        .map(User::getEmail)
                                        .orElse(null),
                                o.getTotalAmount(),
                                o.getPaidAt(),
                                STATUS_PAID,
                                couponCounts.getOrDefault(o.getId(), 0L)));
    }

    @Transactional(readOnly = true)
    public AdminOrderDetailResponse detail(long shopOrderId) {
        ShopOrder shop =
                shopOrderRepository
                        .findById(shopOrderId)
                        .orElseThrow(() -> BusinessException.notFound("주문을 찾을 수 없습니다."));
        CheckoutConfirmResponse orderPayload = checkoutSettlementService.toCheckoutConfirmResponse(shop);
        User buyer = shop.getUserId() != null ? userRepository.findById(shop.getUserId()).orElse(null) : null;
        return new AdminOrderDetailResponse(
                shop.getUserId(),
                buyer != null ? buyer.getEmail() : null,
                buyer != null ? buyer.getName() : null,
                orderPayload);
    }

    private Map<Long, Long> loadCouponCounts(Collection<Long> orderIds) {
        if (orderIds.isEmpty()) {
            return Map.of();
        }
        List<Object[]> rows = couponCodeRepository.countGroupedByOrderId(orderIds);
        Map<Long, Long> m = new HashMap<>();
        for (Object[] row : rows) {
            if (row[0] == null || row[1] == null) {
                continue;
            }
            m.put(((Number) row[0]).longValue(), ((Number) row[1]).longValue());
        }
        return m;
    }
}
