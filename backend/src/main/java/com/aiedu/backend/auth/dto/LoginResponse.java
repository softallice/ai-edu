package com.aiedu.backend.auth.dto;

/**
 * 로그인 응답. 프론트엔드는 {@code accessToken} 을 쿠키에 저장하고 {@code user} 를 상태로 둡니다.
 */
public record LoginResponse(
        String accessToken,
        AuthUserResponse user) {
}
