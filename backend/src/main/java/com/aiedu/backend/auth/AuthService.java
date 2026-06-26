package com.aiedu.backend.auth;

import com.aiedu.backend.auth.dto.AuthUserResponse;
import com.aiedu.backend.auth.dto.LoginRequest;
import com.aiedu.backend.auth.dto.LoginResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 인증 비즈니스 로직.
 *
 * <p>레거시 {@code ComLoginServiceImpl}(세션 저장 + 메뉴/메시지 로딩)의 "자격 증명 검증 → 인증
 * 토큰 발급" 핵심만 모던화했습니다. 상태를 서버 세션에 두지 않고 JWT 로 전달하는 무상태 방식입니다.
 */
@Service
@Transactional(readOnly = true)
public class AuthService {

    private static final String BEARER_PREFIX = "Bearer ";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    /** 로그인: 자격 증명 검증 후 JWT 발급. 레거시 ComLogin_Login.do. */
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(InvalidCredentialsException::new);
        // 사용자 존재 여부를 노출하지 않도록 모든 실패를 동일한 예외로 처리합니다.
        if (!user.isActive() || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        JwtTokenProvider.IssuedToken token = tokenProvider.issue(user, System.currentTimeMillis());
        return new LoginResponse(token.value(), AuthUserResponse.of(user, token.expiresAtMillis()));
    }

    /** 현재 사용자 조회: {@code Authorization: Bearer <token>} 검증. 레거시 ComLogin_Mainframe(사용자정보) 일부. */
    public AuthUserResponse currentUser(String authorizationHeader) {
        String token = extractBearer(authorizationHeader);
        JwtTokenProvider.TokenClaims claims = tokenProvider.parse(token, System.currentTimeMillis());
        // 토큰 발급 이후 삭제/비활성화된 계정을 걸러내기 위해 DB 를 다시 확인합니다.
        User user = userRepository.findByEmail(claims.email())
                .filter(User::isActive)
                .orElseThrow(() -> new InvalidTokenException("계정을 사용할 수 없습니다."));
        return AuthUserResponse.of(user, claims.expiresAtMillis());
    }

    private String extractBearer(String header) {
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            throw new InvalidTokenException("Authorization 헤더가 없거나 Bearer 형식이 아닙니다.");
        }
        return header.substring(BEARER_PREFIX.length()).trim();
    }
}
