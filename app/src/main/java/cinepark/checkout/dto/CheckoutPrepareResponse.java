package cinepark.checkout.dto;

import java.time.Instant;

public record CheckoutPrepareResponse(
        String merchantOrderId,
        long amount,
        String customerKey,
        Instant expiresAt,
        String orderName) {}
