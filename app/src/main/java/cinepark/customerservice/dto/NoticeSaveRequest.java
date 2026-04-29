package cinepark.customerservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class NoticeSaveRequest {

    @Size(max = 32)
    private String category;

    @NotBlank
    @Size(max = 255)
    private String title;

    @NotBlank
    private String body;

    private boolean pinned;
}
