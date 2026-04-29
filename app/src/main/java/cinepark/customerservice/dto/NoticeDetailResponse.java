package cinepark.customerservice.dto;

import java.time.Instant;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class NoticeDetailResponse {
    Long id;
    String category;
    String title;
    String body;
    boolean pinned;
    Instant createdAt;
    Instant updatedAt;

    public static NoticeDetailResponse from(cinepark.customerservice.Notice n) {
        return NoticeDetailResponse.builder()
                .id(n.getId())
                .category(n.getCategory())
                .title(n.getTitle())
                .body(n.getBody())
                .pinned(n.isPinned())
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .build();
    }
}
