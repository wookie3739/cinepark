package cinepark.catalog;

import cinepark.catalog.dto.CouponProductBatchRequest;
import cinepark.catalog.dto.CouponProductDetailResponse;
import cinepark.catalog.dto.CouponProductSummaryResponse;
import cinepark.catalog.dto.CouponProductUsageLinkResponse;
import cinepark.common.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class CouponProductPublicController {

    private final PublicCatalogQueryService catalogQueryService;

    @GetMapping("/usage-links")
    public ApiResponse<List<CouponProductUsageLinkResponse>> usageLinks() {
        return ApiResponse.success(catalogQueryService.listSellableProductsWithUsageLink());
    }

    @GetMapping
    public ApiResponse<Page<CouponProductSummaryResponse>> list(
            @RequestParam(required = false) String categoryCode,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(catalogQueryService.listProducts(categoryCode, pageable));
    }

    @PostMapping("/batch")
    public ApiResponse<List<CouponProductDetailResponse>> batch(
            @Valid @RequestBody CouponProductBatchRequest req) {
        if (req.getProductCodes() == null) {
            return ApiResponse.success(List.of());
        }
        return ApiResponse.success(catalogQueryService.batchByProductCodes(req.getProductCodes()));
    }

    /** 공개 상세는 12자리 productCode 로만 조회합니다. */
    @GetMapping("/{productCode:[0-9]{12}}")
    public ApiResponse<CouponProductDetailResponse> detail(@PathVariable String productCode) {
        return ApiResponse.success(catalogQueryService.getByProductCode(productCode));
    }
}
