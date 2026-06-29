package com.aiedu.backend.accounting;

import org.springframework.data.jpa.repository.JpaRepository;

/** 세금그룹 레포지토리. */
public interface TaxGroupRepository extends JpaRepository<TaxGroup, Long> {
    boolean existsByCode(String code);
}
