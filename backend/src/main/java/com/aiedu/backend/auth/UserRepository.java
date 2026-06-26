package com.aiedu.backend.auth;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** 사용자 영속성 계층. 레거시 COMLOGIN.LOGINCHECK(TM_USERXM 조회) 대응. */
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
