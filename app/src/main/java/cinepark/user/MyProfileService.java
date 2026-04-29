package cinepark.user;

import cinepark.common.BusinessException;
import cinepark.common.DuplicatePhoneException;
import cinepark.user.dto.MyProfileResponse;
import cinepark.user.dto.MyProfileUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MyProfileService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public MyProfileResponse get(Long userId) {
        User user =
                userRepository.findById(userId).orElseThrow(() -> BusinessException.notFound("회원을 찾을 수 없습니다."));
        return map(user);
    }

    @Transactional
    public MyProfileResponse update(Long userId, MyProfileUpdateRequest req) {
        User user =
                userRepository.findById(userId).orElseThrow(() -> BusinessException.notFound("회원을 찾을 수 없습니다."));

        String phone = normalizePhone(req.getPhoneNumber());
        validatePhoneDigits(phone);
        String current = user.getPhoneNumber();
        if (!phone.equals(current)) {
            if (userRepository.existsOtherUserWithPhoneNumber(phone, userId)) {
                throw new DuplicatePhoneException();
            }
        }

        user.setName(req.getName().trim());
        user.setPhoneNumber(phone);
        userRepository.save(user);
        return map(user);
    }

    static void validatePhoneDigits(String normalized) {
        if (normalized.length() < 9 || normalized.length() > 11) {
            throw new IllegalArgumentException("전화번호는 숫자 9~11자리로 입력해 주세요.");
        }
    }

    private static MyProfileResponse map(User user) {
        return MyProfileResponse.builder()
                .email(user.getEmail())
                .name(user.getName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole().name())
                .build();
    }

    private static String normalizePhone(String raw) {
        if (raw == null || raw.isBlank()) {
            return "";
        }
        return raw.replaceAll("\\D", "");
    }
}
