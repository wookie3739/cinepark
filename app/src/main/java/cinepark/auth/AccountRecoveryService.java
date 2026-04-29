package cinepark.auth;

import cinepark.auth.dto.FindIdRequest;
import cinepark.auth.dto.FindIdResponse;
import cinepark.auth.dto.PasswordResetConfirmRequest;
import cinepark.mail.NotificationMailService;
import cinepark.user.PasswordResetCode;
import cinepark.user.PasswordResetCodeRepository;
import cinepark.user.User;
import cinepark.user.UserRepository;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AccountRecoveryService {

    private static final Duration CODE_VALIDITY = Duration.ofMinutes(10);

    private final UserRepository userRepository;
    private final PasswordResetCodeRepository passwordResetCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationMailService notificationMailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public FindIdResponse findLoginId(FindIdRequest request) {
        User user = userRepository
                .findByPhoneNumber(request.getPhoneNumber().trim())
                .orElseThrow(() -> new IllegalArgumentException("일치하는 회원이 없습니다."));
        return FindIdResponse.builder()
                .email(user.getEmail())
                .build();
    }

    @Transactional
    public void sendPasswordResetCode(String emailRaw) {
        String email = normalizeEmail(emailRaw);
        User user = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("등록된 이메일이 아닙니다."));
        String code = String.format("%06d", secureRandom.nextInt(1_000_000));
        Instant expiresAt = Instant.now().plus(CODE_VALIDITY);
        passwordResetCodeRepository.deleteByEmail(email);
        passwordResetCodeRepository.save(
                PasswordResetCode.builder().email(email).code(code).expiresAt(expiresAt).build());

        String body =
                "[CINEPARK COUPON] 비밀번호 재설정 인증번호는 아래와 같습니다.\n\n인증번호: "
                        + code
                        + "\n\n유효시간은 10분입니다. 본인이 요청한 것이 아니면 이 메일을 무시하세요.";
        notificationMailService.sendPlain(user.getEmail(), "[CINEPARK] 비밀번호 재설정 인증번호", body);
    }

    @Transactional
    public void confirmPasswordReset(PasswordResetConfirmRequest request) {
        String email = normalizeEmail(request.getEmail());
        PasswordResetCode row = passwordResetCodeRepository
                .findByEmailAndCode(email, request.getCode().trim())
                .orElseThrow(() -> new IllegalArgumentException("인증번호가 올바르지 않습니다."));
        if (row.isExpired()) {
            passwordResetCodeRepository.delete(row);
            throw new IllegalArgumentException("인증번호가 만료되었습니다. 다시 발급 받아 주세요.");
        }
        User user = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("등록된 이메일이 아닙니다."));
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        passwordResetCodeRepository.deleteByEmail(email);
    }

    private static String normalizeEmail(String raw) {
        return raw.trim().toLowerCase();
    }
}
