package cinepark.catalog;

import cinepark.catalog.dto.CouponCategoryResponse;
import cinepark.catalog.dto.CouponCategorySaveRequest;
import cinepark.common.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCouponCategoryController {

    private final AdminCouponCategoryService adminCouponCategoryService;

    @GetMapping
    public ApiResponse<List<CouponCategoryResponse>> list() {
        return ApiResponse.success(adminCouponCategoryService.listAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<CouponCategoryResponse> get(@PathVariable Long id) {
        return ApiResponse.success(adminCouponCategoryService.get(id));
    }

    @PostMapping
    public ApiResponse<CouponCategoryResponse> create(@Valid @RequestBody CouponCategorySaveRequest req) {
        return ApiResponse.success(adminCouponCategoryService.create(req), "등록되었습니다.");
    }

    @PutMapping("/{id}")
    public ApiResponse<CouponCategoryResponse> update(
            @PathVariable Long id, @Valid @RequestBody CouponCategorySaveRequest req) {
        return ApiResponse.success(adminCouponCategoryService.update(id, req), "수정되었습니다.");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        adminCouponCategoryService.delete(id);
        return ApiResponse.success(null, "삭제되었습니다.");
    }
}
