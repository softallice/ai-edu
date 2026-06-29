package com.aiedu.backend.commoncode;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/** 공통코드 레포지토리. */
public interface CommonCodeRepository
        extends JpaRepository<CommonCode, Long>, JpaSpecificationExecutor<CommonCode> {
    boolean existsByCodeGroupAndCode(String codeGroup, String code);
}
