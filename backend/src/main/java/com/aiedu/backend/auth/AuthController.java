package com.aiedu.backend.auth;

import com.aiedu.backend.auth.dto.AuthUserResponse;
import com.aiedu.backend.auth.dto.LoginRequest;
import com.aiedu.backend.auth.dto.LoginResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 인증 REST API.
 *
 * <p>레거시 {@code ComLoginController} 의 {@code .do} 엔드포인트(Login/Logout/Mainframe)를
 * 무상태 JWT 기반 REST 로 모던화했습니다. 프론트엔드(shadcn-admin) 로그인 폼과 계약을 맞춥니다.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** 로그인. 레거시 ComLogin_Login.do */
    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /** 현재 사용자 정보. 레거시 ComLogin_Mainframe.do(사용자정보) */
    @GetMapping("/me")
    public AuthUserResponse me(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization) {
        return authService.currentUser(authorization);
    }

    /**
     * 로그아웃. 무상태 JWT 에서는 서버가 보관하는 세션이 없으므로 클라이언트가 토큰을 폐기하면 됩니다.
     * 레거시 ComLogin_Logout.do(session.invalidate) 대응.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }
}
