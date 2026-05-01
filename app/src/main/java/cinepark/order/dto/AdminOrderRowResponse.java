package cinepark.order.dto;

import java.time.Instant;

/** 관리자 주문 목록 한 행 (`shop_orders` 기준 — 현재 적재되는 건 결제 확정 건만). */
public record AdminOrderRowResponse(
        long shopOrderId,
        String merchantOrderId,
        String tossPaymentKey,
        Long buyerUserId,
        String buyerEmail,
        long totalAmount,
        Instant paidAt,
        /** 스키마에 취소 플래그가 없어 현재 항상 PAID 고정 가능 */
        String status,
        long issuedCouponCount) {}
