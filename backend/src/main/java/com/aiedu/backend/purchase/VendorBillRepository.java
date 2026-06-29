package com.aiedu.backend.purchase;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface VendorBillRepository
        extends JpaRepository<VendorBill, Long>, JpaSpecificationExecutor<VendorBill> {
    boolean existsByCode(String code);
}
