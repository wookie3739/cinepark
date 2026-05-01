package cinepark.checkout.dto;

import jakarta.validation.constraints.NotBlank;

public record PaymentAbandonRequest(@NotBlank String merchantOrderId) {}
