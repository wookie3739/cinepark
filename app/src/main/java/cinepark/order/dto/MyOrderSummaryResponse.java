package cinepark.order.dto;

import java.time.Instant;

/** 마이페이지 주문 목록 요약 행 */
public record MyOrderSummaryResponse(
        long shopOrderId,
        String merchantOrderId,
        long totalAmount,
        Instant paidAt,
        long issuedCouponCount) {}
