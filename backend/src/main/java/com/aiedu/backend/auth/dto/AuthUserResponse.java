package com.aiedu.backend.auth.dto;

import com.aiedu.backend.auth.User;
import java.util.List;

/**
 * 인증된 사용자 정보. 프론트엔드 {@code auth-store} 의 AuthUser 와 필드를 정렬합니다
 * (accountNo, email, role[], exp). {@code exp} 는 토큰 만료 시각(epoch millis).
 */
public record AuthUserResponse(
        String accountNo,
        String email,
        String name,
        List<String> role,
        long exp) {

    public static AuthUserResponse of(User user, long expiresAtMillis) {
        return new AuthUserResponse(
                user.getAccountNo(),
                user.getEmail(),
                user.getName(),
                List.copyOf(user.getRoles()),
                expiresAtMillis);
    }
}
