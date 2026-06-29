package com.aiedu.backend.accounting;

import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;

/** 분개전표 동적 검색 조건. */
public final class JournalEntrySpecifications {

    private JournalEntrySpecifications() {
    }

    /** 키워드 — name 또는 ref 포함. */
    public static Specification<JournalEntry> keyword(String kw) {
        return (root, q, cb) -> {
            if (kw == null || kw.isBlank()) return cb.conjunction();
            String like = "%" + kw.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("ref")), like));
        };
    }

    /** 장부 코드 — journal.code 조인 후 일치. */
    public static Specification<JournalEntry> journalCodeEquals(String journalCode) {
        return (root, q, cb) -> {
            if (journalCode == null || journalCode.isBlank()) return cb.conjunction();
            return cb.equal(root.join("journal").get("code"), journalCode);
        };
    }

    /** 전표 일자 시작일. */
    public static Specification<JournalEntry> dateFrom(LocalDate from) {
        return (root, q, cb) -> from == null
                ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("entryDate"), from);
    }

    /** 전표 일자 종료일. */
    public static Specification<JournalEntry> dateTo(LocalDate to) {
        return (root, q, cb) -> to == null
                ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.get("entryDate"), to);
    }
}
