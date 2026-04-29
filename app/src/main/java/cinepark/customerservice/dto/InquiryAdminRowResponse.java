package cinepark.customerservice.dto;

import cinepark.customerservice.InquiryStatus;
import java.time.Instant;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class InquiryAdminRowResponse {
    Long id;
    String writerEmail;
    String title;
    InquiryStatus status;
    Instant createdAt;
}
