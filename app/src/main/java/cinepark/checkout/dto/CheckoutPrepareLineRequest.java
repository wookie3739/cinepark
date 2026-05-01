package cinepark.checkout.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

/** prepare 시 클라가 보낸 의도 라인 — 금액·단가는 서버가 상품 기준으로 재검증한다. */
public record CheckoutPrepareLineRequest(
        @NotBlank String productCode,
        @Min(1) @Max(99) int quantity) {}
