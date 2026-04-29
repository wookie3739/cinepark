package cinepark.customerservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InquiryAnswerRequest {

    @NotBlank
    private String answer;
}
