package cinepark.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "이름은 필수입니다")
    @Size(min = 2, max = 50, message = "이름은 2~50자 사이여야 합니다")
    private String name;

    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "유효한 이메일 형식이 아닙니다")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다")
    @Size(min = 8, max = 100, message = "비밀번호는 8~100자 사이여야 합니다")
    private String password;

    @NotBlank(message = "전화번호는 필수입니다")
    @Pattern(regexp = "^[0-9]{9,11}$", message = "숫자 9~11자리만 입력할 수 있습니다 (하이픈 없음)")
    private String phoneNumber;

    @NotNull(message = "이용약관 동의가 필요합니다")
    private Boolean agreeTerms;

    @NotNull(message = "개인정보 처리방침 동의가 필요합니다")
    private Boolean agreePrivacy;

    private Boolean agreeMarketing;
}
