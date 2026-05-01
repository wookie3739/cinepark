package cinepark.checkout;

import cinepark.checkout.dto.CheckoutConfirmResponse;
import cinepark.checkout.dto.PaymentConfirmRequest;
import cinepark.common.BusinessException;
import cinepark.toss.TossPaymentApproved;
import cinepark.toss.TossPaymentsApiClient;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CheckoutOrchestrationService {

    private final CheckoutDraftService checkoutDraftService;
    private final CheckoutSettlementService checkoutSettlementService;
    private final TossPaymentsApiClient tossPaymentsApiClient;

    public CheckoutConfirmResponse confirmPayment(Long userId, PaymentConfirmRequest request) {
        PaymentCheckout checkout =
                checkoutDraftService.loadCheckoutForDecision(request.orderId(), userId);

        if (checkout.getStatus() == PaymentCheckoutStatus.PAID && checkout.getShopOrderId() != null) {
            return checkoutSettlementService.paidOrderSnapshot(checkout.getShopOrderId());
        }
        if (checkout.getStatus() == PaymentCheckoutStatus.EXPIRED) {
            throw BusinessException.of(
                    HttpStatus.GONE, "결제 준비가 만료되었습니다.", "CHECKOUT_EXPIRED");
        }
        if (checkout.getStatus() == PaymentCheckoutStatus.ABANDONED) {
            throw BusinessException.of(
                    HttpStatus.CONFLICT, "취소된 결제 시도입니다.", "CHECKOUT_ABANDONED");
        }
        if (checkout.getStatus() != PaymentCheckoutStatus.PENDING) {
            throw BusinessException.of(HttpStatus.CONFLICT, "결제 시도 상태가 유효하지 않습니다.", "CHECKOUT_INVALID_STATE");
        }

        if (!Objects.equals(checkout.getMerchantOrderId(), request.orderId())) {
            throw BusinessException.badRequest("주문번호가 일치하지 않습니다.");
        }
        if (!Objects.equals(checkout.getTotalAmount(), request.amount())) {
            throw BusinessException.of(
                    HttpStatus.BAD_REQUEST,
                    "주문 금액과 요청 금액이 일치하지 않습니다.",
                    "PAYMENT_AMOUNT_MISMATCH");
        }

        TossPaymentApproved toss;
        try {
            toss = tossPaymentsApiClient.confirmPayment(
                    request.paymentKey(), request.orderId(), request.amount());
        } catch (RuntimeException ex) {
            log.warn("toss payments confirm skipped or failed merchantOrder={}", request.orderId(), ex);
            throw ex;
        }

        if (!Objects.equals(toss.orderId(), request.orderId())
                || !Objects.equals(toss.totalAmount(), request.amount())) {
            tossPaymentsApiClient.cancelPaymentQuietly(request.paymentKey(), "금액/주문 불일치");
            throw BusinessException.of(
                    HttpStatus.BAD_REQUEST,
                    "PG가 반환한 주문 또는 금액이 우리 저장값과 일치하지 않습니다.",
                    "PG_RESPONSE_MISMATCH");
        }
        if (!Objects.equals(toss.paymentKey(), request.paymentKey())) {
            tossPaymentsApiClient.cancelPaymentQuietly(request.paymentKey(), "키 불일치");
            throw BusinessException.badRequest("결제 키 검증 실패입니다.");
        }

        try {
            return checkoutSettlementService.completePaymentAfterToss(userId, toss, request.paymentKey());
        } catch (RuntimeException ex) {
            tossPaymentsApiClient.cancelPaymentQuietly(request.paymentKey(), "쿠폰 발급 실패");
            throw ex;
        }
    }
}
