package cinepark.checkout.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record CheckoutConfirmResponse(
        @JsonProperty("shopOrderId") long shopOrderId,
        @JsonProperty("merchantOrderId") String merchantOrderId,
        @JsonProperty("receiptUrl") String receiptUrl,
        @JsonProperty("lines") List<ConfirmIssuedLineResponse> lines) {}
