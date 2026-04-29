package cinepark.catalog.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class CatalogImagePresignResponse {
    String uploadUrl;
    String objectKey;
    int expiresInMinutes;
}
