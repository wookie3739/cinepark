package cinepark.config;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class SecurityUtils {

    /** JWT 필터에서 principal 로 Long(userId) 를 저장한 경우에만 동작합니다. */
    public static Long requireUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("인증되지 않은 요청입니다.");
        }
        Object p = auth.getPrincipal();
        if (p instanceof Long id) {
            return id;
        }
        throw new IllegalStateException("사용자 정보를 확인할 수 없습니다.");
    }
}
