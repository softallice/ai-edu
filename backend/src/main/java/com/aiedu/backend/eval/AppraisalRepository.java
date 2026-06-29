package com.aiedu.backend.eval;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AppraisalRepository
        extends JpaRepository<Appraisal, Long>, JpaSpecificationExecutor<Appraisal> {
    boolean existsByCode(String code);
}
