package cinepark.catalog.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CartItemUpsertRequest {

    @NotBlank
    private String productCode;

    @Min(0)
    private int quantity;
}
