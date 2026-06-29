package com.aiedu.backend.pm;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/** 예산대실적 레포지토리. */
public interface BudgetRepository extends JpaRepository<Budget, Long>, JpaSpecificationExecutor<Budget> {
    /** 코드 중복 여부 확인. */
    boolean existsByCode(String code);
}
