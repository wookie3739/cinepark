package cinepark.catalog.dto;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CouponProductDetailResponse {

    private final String productCode;
    private final String categoryCode;
    private final String categoryLabel;
    private final String name;
    private final String brandLabel;
    private final int unitPrice;
    private final int originPrice;
    private final String shortDesc;
    private final List<String> bullets;
    private final String noticeHtml;
    private final String mainImageUrl;
    private final List<String> detailImageUrls;
    private final long availableStock;
    /** 관리자 폼 바인딩용 (공개 목록에서는 null 또는 숨김 가능) */
    private final Long categoryId;
    private final String mainImageKey;
    /** DB 저장 형태(JSON 배열 문자열) */
    private final String detailImageKeys;
    /** 제휴 사용처 URL — 없으면 null */
    private final String usageUrl;
}
