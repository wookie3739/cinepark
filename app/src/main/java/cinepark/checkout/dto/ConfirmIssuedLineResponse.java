package cinepark.checkout.dto;

import java.util.List;

public record ConfirmIssuedLineResponse(
        String productCode, String productName, int quantity, List<String> issuedCouponCodes) {}
