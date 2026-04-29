package cinepark.user;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetCodeRepository extends JpaRepository<PasswordResetCode, Long> {

    void deleteByEmail(String email);

    Optional<PasswordResetCode> findByEmailAndCode(String email, String code);
}
