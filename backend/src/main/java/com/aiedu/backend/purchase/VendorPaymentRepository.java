package com.aiedu.backend.purchase;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface VendorPaymentRepository
        extends JpaRepository<VendorPayment, Long>, JpaSpecificationExecutor<VendorPayment> {
    boolean existsByCode(String code);
}
