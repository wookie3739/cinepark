package cinepark.catalog;

import cinepark.catalog.dto.CouponCategoryResponse;
import cinepark.common.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CouponCategoryPublicController {

    private final PublicCatalogQueryService catalogQueryService;

    @GetMapping
    public ApiResponse<List<CouponCategoryResponse>> list() {
        return ApiResponse.success(catalogQueryService.listCategories());
    }
}
