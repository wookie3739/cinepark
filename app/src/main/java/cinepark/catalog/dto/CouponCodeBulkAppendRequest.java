package cinepark.catalog.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Data;

@Data
public class CouponCodeBulkAppendRequest {

    @NotEmpty
    private List<@NotEmpty String> credentials;
}
