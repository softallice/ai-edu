package com.aiedu.backend.accounting;

import org.springframework.data.jpa.domain.Specification;

/** 계정과목 동적 검색 조건. */
public final class AccountSpecifications {

    private AccountSpecifications() {
    }

    /** 키워드 — code 또는 name 포함. */
    public static Specification<Account> keyword(String kw) {
        return (root, q, cb) -> {
            if (kw == null || kw.isBlank()) return cb.conjunction();
            String like = "%" + kw.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("code")), like),
                    cb.like(cb.lower(root.get("name")), like));
        };
    }

    /** 계정 유형 정확 일치. */
    public static Specification<Account> typeEquals(AccountType type) {
        return (root, q, cb) -> type == null
                ? cb.conjunction()
                : cb.equal(root.get("type"), type);
    }

    /** 사용 여부 필터. */
    public static Specification<Account> activeEquals(Boolean active) {
        return (root, q, cb) -> active == null
                ? cb.conjunction()
                : cb.equal(root.get("active"), active);
    }
}
