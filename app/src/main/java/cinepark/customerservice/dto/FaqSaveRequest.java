package cinepark.customerservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FaqSaveRequest {

    @NotBlank
    private String question;

    @NotBlank
    private String answer;

    @NotNull
    private Integer sortOrder;
}
