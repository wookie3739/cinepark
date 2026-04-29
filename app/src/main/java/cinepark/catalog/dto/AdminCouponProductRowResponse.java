package cinepark.catalog.dto;

import cinepark.catalog.CouponShelfStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminCouponProductRowResponse {

    private final Long id;
    private final String productCode;
    private final String categoryCode;
    private final String categoryLabel;
    private final String name;
    private final String brandLabel;
    private final CouponShelfStatus shelfStatus;
    private final int unitPrice;
    private final long availableStock;
    /** 사용 링크 등록 여부 */
    private final boolean usageLinkRegistered;
}
