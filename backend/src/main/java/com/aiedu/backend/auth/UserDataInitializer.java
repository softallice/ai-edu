package com.aiedu.backend.auth;

import java.util.Set;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 교육용 사용자 시드.
 *
 * <p>데모 계정 2개를 비어 있을 때만 적재합니다. 비밀번호는 BCrypt 로 인코딩해 저장합니다.
 * (프론트엔드 검증 규칙상 비밀번호는 7자 이상)
 */
@Component
@Order(1)
public class UserDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }
        userRepository.save(User.create(
                "ACC001", "admin@aiedu.local",
                passwordEncoder.encode("admin1234"), "관리자",
                Set.of("ADMIN", "USER")));
        userRepository.save(User.create(
                "ACC002", "user@aiedu.local",
                passwordEncoder.encode("user1234"), "일반사용자",
                Set.of("USER")));
    }
}
