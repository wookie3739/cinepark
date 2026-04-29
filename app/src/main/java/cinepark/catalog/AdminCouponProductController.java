package cinepark.catalog;

import cinepark.catalog.dto.AdminCouponProductRowResponse;
import cinepark.catalog.dto.CouponCodeAdminRowResponse;
import cinepark.catalog.dto.CouponCodeBulkAppendRequest;
import cinepark.catalog.dto.CouponCodeBulkRowsRequest;
import cinepark.catalog.dto.CouponProductDetailResponse;
import cinepark.catalog.dto.CouponProductSaveRequest;
import cinepark.common.ApiResponse;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminCouponProductController {

    private final AdminCouponProductService adminCouponProductService;

    @GetMapping
    public ApiResponse<Page<AdminCouponProductRowResponse>> list(
            @PageableDefault(size = 50, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(adminCouponProductService.list(pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<CouponProductDetailResponse> detail(@PathVariable Long id) {
        return ApiResponse.success(adminCouponProductService.detailForAdmin(id));
    }

    @PostMapping
    public ApiResponse<CouponProductDetailResponse> create(@Valid @RequestBody CouponProductSaveRequest req) {
        return ApiResponse.success(adminCouponProductService.create(req), "등록되었습니다.");
    }

    @PutMapping("/{id}")
    public ApiResponse<CouponProductDetailResponse> update(
            @PathVariable Long id, @Valid @RequestBody CouponProductSaveRequest req) {
        return ApiResponse.success(adminCouponProductService.update(id, req), "수정되었습니다.");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        adminCouponProductService.delete(id);
        return ApiResponse.success(null, "삭제되었습니다.");
    }

    @GetMapping("/{id}/coupon-codes")
    public ApiResponse<Page<CouponCodeAdminRowResponse>> listCouponCodes(
            @PathVariable Long id,
            @PageableDefault(size = 25, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(adminCouponProductService.listCouponCodesForProduct(id, pageable));
    }

    @PostMapping("/{id}/coupon-codes")
    public ApiResponse<Map<String, Integer>> appendCodes(
            @PathVariable Long id, @Valid @RequestBody CouponCodeBulkAppendRequest req) {
        int n = adminCouponProductService.appendCouponCodes(id, req);
        return ApiResponse.success(Map.of("added", n), n + "건 추가되었습니다.");
    }

    /** 엑셀 A열 상품 ID + B열 쿠폰번호 등 다행 일괄 등록 */
    @PostMapping("/bulk-coupon-rows")
    public ApiResponse<Map<String, Integer>> bulkAppendCouponRows(@Valid @RequestBody CouponCodeBulkRowsRequest req) {
        int n = adminCouponProductService.appendCouponCodesBulk(req.getRows());
        return ApiResponse.success(Map.of("added", n), n + "건 추가되었습니다.");
    }
}
