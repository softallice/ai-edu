package com.aiedu.backend.accounting;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/** 분개전표 레포지토리. */
public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long>, JpaSpecificationExecutor<JournalEntry> {
    boolean existsByName(String name);
    long countByNameStartingWith(String prefix);
}
