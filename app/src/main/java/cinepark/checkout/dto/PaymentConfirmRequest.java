package cinepark.checkout.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PaymentConfirmRequest(
        @NotBlank String paymentKey,
        /** prepare 응답 merchantOrderId — 토스 orderId 동일 */
        @NotBlank String orderId,
        @NotNull @Positive Long amount) {}
