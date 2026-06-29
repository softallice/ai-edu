package com.aiedu.backend.finance;

import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;

/** 전표 동적 검색 조건. */
public final class VoucherSpecifications {

    private VoucherSpecifications() {
    }

    /**
     * 키워드 검색 — 전표번호(code) 또는 계정과목(account) 포함.
     */
    public static Specification<Voucher> keyword(String kw) {
        return (root, q, cb) -> {
            if (kw == null || kw.isBlank()) return cb.conjunction();
            String like = "%" + kw.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("code")), like),
                    cb.like(cb.lower(root.get("account")), like));
        };
    }

    /**
     * 계정과목 정확 일치 검색.
     */
    public static Specification<Voucher> accountEquals(String account) {
        return (root, q, cb) -> (account == null || account.isBlank())
                ? cb.conjunction()
                : cb.equal(root.get("account"), account);
    }

    /**
     * 전표 일자 시작일 조건.
     */
    public static Specification<Voucher> dateFrom(LocalDate from) {
        return (root, q, cb) -> from == null
                ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("voucherDate"), from);
    }

    /**
     * 전표 일자 종료일 조건.
     */
    public static Specification<Voucher> dateTo(LocalDate to) {
        return (root, q, cb) -> to == null
                ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.get("voucherDate"), to);
    }
}
