package com.aiedu.backend.hr;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface EducationRequestRepository
        extends JpaRepository<EducationRequest, Long>, JpaSpecificationExecutor<EducationRequest> {
    boolean existsByCode(String code);
}
