package cinepark.catalog.dto;

import cinepark.catalog.CouponCodeStatus;
import java.time.Instant;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class CouponCodeAdminRowResponse {
    Long id;
    String credential;
    CouponCodeStatus status;
    Long issuedToUserId;
    Long orderId;
    Long orderLineId;
    Instant issuedAt;
    Instant createdAt;
}
