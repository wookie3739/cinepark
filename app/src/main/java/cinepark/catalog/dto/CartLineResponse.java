package cinepark.catalog.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CartLineResponse {

    private final String productCode;
    private final String name;
    private final String brandLabel;
    private final int unitPrice;
    private final int originPrice;
    private final int quantity;
    private final int lineTotal;
    private final String mainImageUrl;
}
