package cinepark.auth;

import cinepark.auth.dto.AuthResponse;
import cinepark.auth.dto.FindIdRequest;
import cinepark.auth.dto.FindIdResponse;
import cinepark.auth.dto.LoginRequest;
import cinepark.auth.dto.PasswordResetConfirmRequest;
import cinepark.auth.dto.PasswordResetSendRequest;
import cinepark.auth.dto.RefreshTokenRequest;
import cinepark.auth.dto.RefreshTokenResponse;
import cinepark.auth.dto.RegisterRequest;
import cinepark.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AccountRecoveryService accountRecoveryService;

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success(authService.register(request), "회원가입이 완료되었습니다.");
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request), "로그인되었습니다.");
    }

    @PostMapping("/refresh")
    public ApiResponse<RefreshTokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ApiResponse.success(authService.refresh(request), "토큰이 갱신되었습니다.");
    }

    /** Stateless JWT 기준 로그아웃은 클라이언트 토큰 삭제만으로 충분. API는 성공 형식 통일용. */
    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        return ApiResponse.success(null, "로그아웃되었습니다.");
    }

    @PostMapping("/find-id")
    public ApiResponse<FindIdResponse> findId(@Valid @RequestBody FindIdRequest request) {
        return ApiResponse.success(accountRecoveryService.findLoginId(request), "조회되었습니다.");
    }

    @PostMapping("/password-reset/send-code")
    public ApiResponse<Void> sendPasswordResetCode(@Valid @RequestBody PasswordResetSendRequest request) {
        accountRecoveryService.sendPasswordResetCode(request.getEmail());
        return ApiResponse.success(null, "인증번호를 이메일로 발송했습니다.");
    }

    @PostMapping("/password-reset/confirm")
    public ApiResponse<Void> confirmPasswordReset(@Valid @RequestBody PasswordResetConfirmRequest request) {
        accountRecoveryService.confirmPasswordReset(request);
        return ApiResponse.success(null, "비밀번호가 변경되었습니다.");
    }
}
