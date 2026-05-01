package cinepark.checkout;

/** 결제 시도({@link PaymentCheckout}) 상태 — 설계 문서 §3.1 */
public enum PaymentCheckoutStatus {
    PENDING,
    ABANDONED,
    EXPIRED,
    PAID
}
