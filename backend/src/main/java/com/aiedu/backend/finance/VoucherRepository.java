package com.aiedu.backend.finance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/** 전표 레포지토리. */
public interface VoucherRepository extends JpaRepository<Voucher, Long>, JpaSpecificationExecutor<Voucher> {

    /** 전표 번호 중복 여부 확인. */
    boolean existsByCode(String code);
}
