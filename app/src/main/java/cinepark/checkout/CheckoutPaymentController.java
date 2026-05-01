package cinepark.checkout;

import cinepark.checkout.dto.AbandonCheckoutResponseBody;
import cinepark.checkout.dto.CheckoutConfirmResponse;
import cinepark.checkout.dto.CheckoutPrepareRequestBody;
import cinepark.checkout.dto.CheckoutPrepareResponse;
import cinepark.checkout.dto.PaymentAbandonRequest;
import cinepark.checkout.dto.PaymentConfirmRequest;
import cinepark.common.ApiResponse;
import cinepark.config.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/checkout/payments")
@RequiredArgsConstructor
public class CheckoutPaymentController {

    private final CheckoutDraftService checkoutDraftService;
    private final CheckoutOrchestrationService checkoutOrchestrationService;

    @PostMapping("/prepare")
    public ApiResponse<CheckoutPrepareResponse> prepare(
            @RequestBody(required = false) @Valid CheckoutPrepareRequestBody body) {
        CheckoutPrepareRequestBody effective = body == null ? CheckoutPrepareRequestBody.EMPTY : body;
        return ApiResponse.success(
                checkoutDraftService.prepare(SecurityUtils.requireUserId(), effective), "결제 준비가 완료되었습니다.");
    }

    @PostMapping("/abandon")
    public ApiResponse<AbandonCheckoutResponseBody> abandon(@Valid @RequestBody PaymentAbandonRequest request) {
        return ApiResponse.success(
                checkoutDraftService.abandon(SecurityUtils.requireUserId(), request.merchantOrderId()),
                "결제 시도가 취소되었습니다.");
    }

    @PostMapping("/confirm")
    public ApiResponse<CheckoutConfirmResponse> confirm(@Valid @RequestBody PaymentConfirmRequest request) {
        return ApiResponse.success(
                checkoutOrchestrationService.confirmPayment(SecurityUtils.requireUserId(), request),
                "결제가 완료되었습니다.");
    }
}
