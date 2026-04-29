package cinepark.catalog.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CouponProductUsageLinkResponse {

    private final String productCode;
    private final String name;
    private final String brandLabel;
    /** 비어 있으면 null — 웹 사용 링크 미등록 */
    private final String usageUrl;
}
