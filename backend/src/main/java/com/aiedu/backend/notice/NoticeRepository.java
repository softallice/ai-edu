package com.aiedu.backend.notice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface NoticeRepository
        extends JpaRepository<Notice, Long>, JpaSpecificationExecutor<Notice> {
    boolean existsByCode(String code);
}
