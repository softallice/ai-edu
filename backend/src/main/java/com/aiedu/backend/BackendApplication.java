package com.aiedu.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * ai-edu 교육용 Spring Boot 백엔드 진입점.
 *
 * <p>실행: {@code ./gradlew bootRun} → http://localhost:8080
 */
@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
