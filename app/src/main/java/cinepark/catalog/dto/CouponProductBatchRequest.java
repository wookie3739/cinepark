package cinepark.catalog.dto;

import java.util.List;
import lombok.Data;

@Data
public class CouponProductBatchRequest {

    private List<String> productCodes;
}
