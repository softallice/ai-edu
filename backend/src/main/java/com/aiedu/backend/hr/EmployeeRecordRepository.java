package com.aiedu.backend.hr;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface EmployeeRecordRepository
        extends JpaRepository<EmployeeRecord, Long>, JpaSpecificationExecutor<EmployeeRecord> {
    boolean existsByCode(String code);
}
