package cinepark.catalog.dto;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CartViewResponse {

    private final List<CartLineResponse> lines;
    private final int totalAmount;
    private final int lineCount;
}
