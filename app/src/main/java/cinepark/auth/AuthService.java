package cinepark.auth;

import java.time.Instant;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cinepark.auth.dto.AuthResponse;
import cinepark.auth.dto.LoginRequest;
import cinepark.auth.dto.RefreshTokenRequest;
import cinepark.auth.dto.RefreshTokenResponse;
import cinepark.auth.dto.RegisterRequest;
import cinepark.common.DuplicateEmailException;
import cinepark.common.DuplicatePhoneException;
import cinepark.common.InvalidCredentialsException;
import cinepark.jwt.IssuedRefreshToken;
import cinepark.jwt.JwtService;
import cinepark.user.User;
import cinepark.user.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserRefreshTokenRepository userRefreshTokenRepository;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (Boolean.FALSE.equals(request.getAgreeTerms()) || Boolean.FALSE.equals(request.getAgreePrivacy())) {
            throw new IllegalArgumentException("필수 약관에 동의해야 합니다.");
        }
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateEmailException();
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new DuplicatePhoneException();
        }
        boolean marketing = Boolean.TRUE.equals(request.getAgreeMarketing());
        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getName().trim())
                .phoneNumber(request.getPhoneNumber())
                .agreeTerms(true)
                .agreePrivacy(true)
                .agreeMarketing(marketing)
                .build();
        user = userRepository.save(user);
        return toAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email).orElseThrow(InvalidCredentialsException::new);
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        return toAuthResponse(user);
    }

    @Transactional
    public RefreshTokenResponse refresh(RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        if (!jwtService.isRefreshTokenValid(token)) {
            throw new IllegalArgumentException("유효하지 않은 리프레시 토큰입니다.");
        }
        String jti =
                jwtService
                        .getJtiFromRefreshToken(token)
                        .orElseThrow(() -> new IllegalArgumentException("다시 로그인해 주세요."));
        UserRefreshToken stored =
                userRefreshTokenRepository
                        .findByJtiAndRevokedFalse(jti)
                        .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 리프레시 토큰입니다."));
        if (stored.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("만료된 리프레시 토큰입니다.");
        }
        Long userId = jwtService.getUserIdFromRefreshToken(token);
        if (userId == null || !stored.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("유효하지 않은 리프레시 토큰입니다.");
        }
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        stored.setRevoked(true);
        userRefreshTokenRepository.save(stored);

        IssuedRefreshToken issued = jwtService.issueRefreshToken(user);
        userRefreshTokenRepository.save(
                UserRefreshToken.builder()
                        .user(user)
                        .jti(issued.jti())
                        .expiresAt(issued.expiresAt())
                        .revoked(false)
                        .build());

        return RefreshTokenResponse.builder()
                .accessToken(jwtService.createAccessToken(user))
                .refreshToken(issued.rawToken())
                .build();
    }

    private AuthResponse toAuthResponse(User user) {
        IssuedRefreshToken issued = jwtService.issueRefreshToken(user);
        userRefreshTokenRepository.save(
                UserRefreshToken.builder()
                        .user(user)
                        .jti(issued.jti())
                        .expiresAt(issued.expiresAt())
                        .revoked(false)
                        .build());

        return AuthResponse.builder()
                .accessToken(jwtService.createAccessToken(user))
                .refreshToken(issued.rawToken())
                .email(user.getEmail())
                .name(user.getName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole().name())
                .build();
    }
}
