package cinepark.customerservice.dto;

import cinepark.customerservice.InquiryStatus;
import java.time.Instant;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class InquiryMineResponse {
    Long id;
    String title;
    String content;
    InquiryStatus status;
    String answer;
    Instant createdAt;
    Instant answeredAt;
}
