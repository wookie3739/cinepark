package cinepark.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CatalogImagePresignRequest {

    @NotBlank
    @Size(max = 255)
    private String fileName;

    /** 예: image/jpeg */
    @NotBlank
    @Size(max = 120)
    private String contentType;
}
