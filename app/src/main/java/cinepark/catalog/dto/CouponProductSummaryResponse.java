package cinepark.catalog.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CouponProductSummaryResponse {

    private final String productCode;
    private final String categoryCode;
    private final String name;
    private final String brandLabel;
    private final int unitPrice;
    private final int originPrice;
    private final String mainImageUrl;
    /** 남은 재고(가용 코드 수). */
    private final long availableStock;
    /** 제휴 사용처 URL — 없으면 null */
    private final String usageUrl;
}
