package com.aiedu.backend.common;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 교육용 CORS 설정.
 *
 * <p>프론트엔드(Vite dev 서버)가 다른 오리진(localhost:5173 등)에서 {@code /api/**} 를 호출할 수
 * 있도록 허용합니다. 인증은 Authorization 헤더(Bearer)로 전달하므로 쿠키 자격증명은 사용하지
 * 않습니다. 운영에서는 실제 프론트 도메인만 허용하도록 좁혀야 합니다.
 */
@Configuration
public class WebCorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] devOrigins = {
                "http://localhost:5173", // Vite dev
                "http://localhost:3000", // 대체 dev 포트 / Nexacro 로컬 서버
                "http://localhost:4173", // Vite preview
                "http://localhost:8080" // 동일 오리진 서빙
        };
        registry.addMapping("/api/**")
                .allowedOrigins(devOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*");
        // Nexacro 연동 어댑터(.do 트랜잭션)도 동일 dev 오리진 허용
        registry.addMapping("/nexacro/**")
                .allowedOrigins(devOrigins)
                .allowedMethods("POST", "OPTIONS")
                .allowedHeaders("*");
    }
}
