package cinepark.checkout.dto;

import java.util.List;

public record CheckoutConfirmResponse(
        long shopOrderId, String merchantOrderId, String receiptUrl, List<ConfirmIssuedLineResponse> lines) {}
