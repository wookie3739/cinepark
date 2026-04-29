package cinepark.customerservice.dto;

import cinepark.customerservice.InquiryStatus;
import java.time.Instant;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class InquiryAdminDetailResponse {
    Long id;
    String writerEmail;
    String writerName;
    String title;
    String content;
    InquiryStatus status;
    String answer;
    Instant createdAt;
    Instant answeredAt;
}
