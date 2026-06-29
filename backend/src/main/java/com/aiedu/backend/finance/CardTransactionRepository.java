package com.aiedu.backend.finance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/** 법인카드 거래내역 레포지토리. */
public interface CardTransactionRepository
        extends JpaRepository<CardTransaction, Long>, JpaSpecificationExecutor<CardTransaction> {

    /** 거래 코드 중복 여부 확인. */
    boolean existsByCode(String code);
}
