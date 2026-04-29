package cinepark.catalog.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Data;

@Data
public class CouponCodeBulkRowsRequest {

    @NotEmpty
    private List<@Valid Row> rows;

    @Data
    public static class Row {

        @NotNull
        private Long productId;

        @NotBlank
        @Size(max = 500)
        private String credential;
    }
}
