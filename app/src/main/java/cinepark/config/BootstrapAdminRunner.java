package cinepark.config;

import cinepark.user.User;
import cinepark.user.UserRepository;
import cinepark.user.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;

@Configuration
@Slf4j
@RequiredArgsConstructor
public class BootstrapAdminRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${cinepark.bootstrap.admin-email:}")
    private String adminEmail;

    @Value("${cinepark.bootstrap.admin-password:}")
    private String adminPassword;

    @Bean
    ApplicationRunner createDefaultAdminUser() {
        return args -> {
            if (!StringUtils.hasText(adminEmail) || !StringUtils.hasText(adminPassword)) {
                log.info("관리자 시드 건너뜀: cinepark.bootstrap.admin-email / admin-password 미설정");
                return;
            }
            String email = adminEmail.trim().toLowerCase();
            if (userRepository.existsByEmailIgnoreCase(email)) {
                return;
            }
            User admin =
                    User.builder()
                            .email(email)
                            .passwordHash(passwordEncoder.encode(adminPassword))
                            .name("운영관리자")
                            .phoneNumber("01099000002")
                            .role(UserRole.ADMIN)
                            .agreeTerms(true)
                            .agreePrivacy(true)
                            .agreeMarketing(false)
                            .build();
            userRepository.save(admin);
            log.warn("관리자 계정 생성됨(email={}). 운영 전 비밀번호를 변경하고 시드 속성 제거 검토.", email);
        };
    }
}
