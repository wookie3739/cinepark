package cinepark.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MyProfileUpdateRequest {

    @NotBlank(message = "이름은 필수입니다")
    @Size(min = 2, max = 50, message = "이름은 2~50자 사이여야 합니다")
    private String name;

    /** 입력 시 하이픈 허용 — 서버에서 숫자만 추출 후 검증 */
    @NotBlank(message = "전화번호는 필수입니다")
    @Size(max = 24, message = "전화번호가 너무 깁니다")
    private String phoneNumber;
}
