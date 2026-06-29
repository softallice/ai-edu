package com.aiedu.backend.hr;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PayslipRepository extends JpaRepository<Payslip, Long>, JpaSpecificationExecutor<Payslip> {
    boolean existsByCode(String code);
}
