package cinepark.toss;

/** 토스 승인 또는 조회 결과의 최소 스냅샷 */
public record TossPaymentApproved(
        String paymentKey, String orderId, long totalAmount, String receiptUrl) {}
