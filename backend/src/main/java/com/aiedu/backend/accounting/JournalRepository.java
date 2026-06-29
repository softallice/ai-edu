package com.aiedu.backend.accounting;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** 장부 레포지토리. */
public interface JournalRepository extends JpaRepository<Journal, Long> {
    Optional<Journal> findByCode(String code);
    boolean existsByCode(String code);
}
