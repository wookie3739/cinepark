package cinepark.customerservice.dto;

import java.time.Instant;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class NoticeSummaryResponse {
    Long id;
    String category;
    String title;
    boolean pinned;
    Instant createdAt;

    public static NoticeSummaryResponse from(cinepark.customerservice.Notice n) {
        return NoticeSummaryResponse.builder()
                .id(n.getId())
                .category(n.getCategory())
                .title(n.getTitle())
                .pinned(n.isPinned())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
