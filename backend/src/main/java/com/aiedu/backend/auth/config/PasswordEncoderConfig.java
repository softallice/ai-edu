package com.aiedu.backend.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * 비밀번호 해시 인코더 빈.
 *
 * <p>전체 Spring Security 필터 체인을 도입하지 않고 {@code spring-security-crypto} 의
 * BCrypt 인코더만 사용합니다(교육용: 다른 엔드포인트는 그대로 열려 있음). 운영에서는
 * Spring Security 필터로 엔드포인트를 실제로 보호해야 합니다.
 */
@Configuration
public class PasswordEncoderConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
