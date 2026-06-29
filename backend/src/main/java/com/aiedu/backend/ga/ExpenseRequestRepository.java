package com.aiedu.backend.ga;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/** 지출품의 레포지토리. */
public interface ExpenseRequestRepository
        extends JpaRepository<ExpenseRequest, Long>, JpaSpecificationExecutor<ExpenseRequest> {
    boolean existsByCode(String code);
}
