package cinepark.user;

import cinepark.user.dto.AdminMemberDetailResponse;
import cinepark.user.dto.AdminMemberRowResponse;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AdminMemberService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<AdminMemberRowResponse> list(String keyword, Pageable pageable) {
        return userRepository.findAll(keywordSpecification(keyword), pageable).map(AdminMemberRowResponse::from);
    }

    @Transactional(readOnly = true)
    public AdminMemberDetailResponse detail(Long userId) {
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        return AdminMemberDetailResponse.from(user);
    }

    private Specification<User> keywordSpecification(String keyword) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(keyword)) {
                return cb.conjunction();
            }
            String term = keyword.trim().toLowerCase();
            List<Predicate> parts = new ArrayList<>();
            parts.add(cb.like(cb.lower(root.get("email")), "%" + term + "%"));
            parts.add(cb.like(cb.lower(root.get("name")), "%" + term + "%"));
            parts.add(cb.like(root.get("phoneNumber"), "%" + keyword.trim() + "%"));
            return cb.or(parts.toArray(new Predicate[0]));
        };
    }
}
