package cinepark.catalog.dto;

import cinepark.catalog.CouponShelfStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CouponProductSaveRequest {

    @NotBlank
    @Size(max = 200)
    private String name;

    @NotBlank
    @Size(max = 120)
    private String brandLabel;

    @NotNull
    @Min(0)
    private Integer unitPrice;

    @NotNull
    @Min(0)
    private Integer originPrice;

    private String shortDesc;

    /** JSON 배열 문자열 ["a","b"] 또는 null */
    private String bullets;

    private String noticeHtml;

    private String mainImageKey;

    private String detailImageKeys;

    /** 제휴 사용처 URL (https://…). 비우면 미등록으로 저장 */
    @Size(max = 2048)
    private String usageUrl;

    @NotNull
    private CouponShelfStatus shelfStatus;

    @NotNull
    private Long categoryId;
}
