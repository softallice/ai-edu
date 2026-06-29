package com.aiedu.backend.accounting;

import org.springframework.data.jpa.repository.JpaRepository;

/** 세금 레포지토리. */
public interface TaxRepository extends JpaRepository<Tax, Long> {
    boolean existsByCode(String code);
}
