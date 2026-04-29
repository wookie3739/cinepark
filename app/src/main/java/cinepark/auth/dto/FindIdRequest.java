package cinepark.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class FindIdRequest {

    @NotBlank(message = "전화번호는 필수입니다")
    @Pattern(regexp = "^[0-9]{9,11}$", message = "숫자 9~11자리만 입력할 수 있습니다 (하이픈 없음)")
    private String phoneNumber;
}
