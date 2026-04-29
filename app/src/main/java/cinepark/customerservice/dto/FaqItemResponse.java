package cinepark.customerservice.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class FaqItemResponse {
    Long id;
    int sortOrder;
    String question;
    String answer;

    public static FaqItemResponse from(cinepark.customerservice.Faq f) {
        return FaqItemResponse.builder()
                .id(f.getId())
                .sortOrder(f.getSortOrder())
                .question(f.getQuestion())
                .answer(f.getAnswer())
                .build();
    }
}
