package com.aiedu.backend.sales;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TaxInvoiceRepository
        extends JpaRepository<TaxInvoice, Long>, JpaSpecificationExecutor<TaxInvoice> {
    boolean existsByCode(String code);
}
