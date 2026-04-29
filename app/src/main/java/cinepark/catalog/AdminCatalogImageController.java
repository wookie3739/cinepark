package cinepark.catalog;

import cinepark.catalog.dto.CatalogImagePresignRequest;
import cinepark.catalog.dto.CatalogImagePresignResponse;
import cinepark.catalog.storage.CatalogImageUploadService;
import cinepark.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/catalog/images")
@RequiredArgsConstructor
public class AdminCatalogImageController {

    private final CatalogImageUploadService catalogImageUploadService;

    /** S3에 브라우저가 직접 PUT할 수 있는 presigned URL — 응답 objectKey를 상품 저장 시 mainImageKey 등에 넣음 */
    @PostMapping("/presign-upload")
    public ApiResponse<CatalogImagePresignResponse> presignUpload(@Valid @RequestBody CatalogImagePresignRequest req) {
        return ApiResponse.success(catalogImageUploadService.presignPut(req));
    }
}
