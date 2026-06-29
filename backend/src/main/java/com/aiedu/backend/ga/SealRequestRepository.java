package com.aiedu.backend.ga;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/** 인감신청 레포지토리. */
public interface SealRequestRepository
        extends JpaRepository<SealRequest, Long>, JpaSpecificationExecutor<SealRequest> {
    boolean existsByCode(String code);
}
