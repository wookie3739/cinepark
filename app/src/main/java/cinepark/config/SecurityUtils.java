package cinepark.config;

import cinepark.common.BusinessException;
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
            throw BusinessException.unauthorized("로그인이 필요합니다.");
        }
        Object p = auth.getPrincipal();
        if (p instanceof Long id) {
            return id;
        }
        throw BusinessException.unauthorized("사용자 정보를 확인할 수 없습니다.");
    }
}
