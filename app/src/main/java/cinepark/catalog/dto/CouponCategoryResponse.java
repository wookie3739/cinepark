package cinepark.catalog.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CouponCategoryResponse {

    private final Long id;
    private final String code;
    private final String label;
    private final int sortOrder;
    private final boolean active;
}
