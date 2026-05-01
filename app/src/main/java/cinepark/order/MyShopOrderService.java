package cinepark.order;

import cinepark.catalog.CouponCodeRepository;
import cinepark.checkout.CheckoutSettlementService;
import cinepark.checkout.dto.CheckoutConfirmResponse;
import cinepark.order.dto.MyOrderSummaryResponse;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MyShopOrderService {

    private final ShopOrderRepository shopOrderRepository;
    private final CouponCodeRepository couponCodeRepository;
    private final CheckoutSettlementService checkoutSettlementService;

    @Transactional(readOnly = true)
    public Page<MyOrderSummaryResponse> listForUser(Long userId, Pageable pageable) {
        Page<ShopOrder> page = shopOrderRepository.findByUserIdOrderByPaidAtDesc(userId, pageable);
        List<Long> orderIds =
                page.getContent().stream().map(ShopOrder::getId).filter(Objects::nonNull).toList();
        Map<Long, Long> couponCounts = loadCouponCounts(orderIds);
        return page.map(
                o ->
                        new MyOrderSummaryResponse(
                                o.getId(),
                                o.getMerchantOrderId() != null ? o.getMerchantOrderId() : "",
                                o.getTotalAmount(),
                                o.getPaidAt(),
                                couponCounts.getOrDefault(o.getId(), 0L)));
    }

    @Transactional(readOnly = true)
    public CheckoutConfirmResponse detailForBuyer(Long userId, long shopOrderId) {
        return checkoutSettlementService.paidOrderSnapshotForBuyer(shopOrderId, userId);
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
