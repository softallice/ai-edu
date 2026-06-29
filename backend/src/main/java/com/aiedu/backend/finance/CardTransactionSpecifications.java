package com.aiedu.backend.finance;

import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;

/** 법인카드 거래내역 동적 검색 조건. */
public final class CardTransactionSpecifications {

    private CardTransactionSpecifications() {
    }

    /**
     * 키워드 검색 — 거래코드(code), 카드번호(cardNo), 가맹점(merchant) 포함.
     */
    public static Specification<CardTransaction> keyword(String kw) {
        return (root, q, cb) -> {
            if (kw == null || kw.isBlank()) return cb.conjunction();
            String like = "%" + kw.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("code")), like),
                    cb.like(cb.lower(root.get("cardNo")), like),
                    cb.like(cb.lower(root.get("merchant")), like));
        };
    }

    /**
     * 상태 정확 일치 검색.
     */
    public static Specification<CardTransaction> statusEquals(CardTransactionStatus status) {
        return (root, q, cb) -> status == null
                ? cb.conjunction()
                : cb.equal(root.get("status"), status);
    }

    /**
     * 청구월 정확 일치 검색. "YYYY-MM" 형식.
     */
    public static Specification<CardTransaction> billingMonthEquals(String billingMonth) {
        return (root, q, cb) -> (billingMonth == null || billingMonth.isBlank())
                ? cb.conjunction()
                : cb.equal(root.get("billingMonth"), billingMonth);
    }

    /**
     * 사용 일자 시작일 조건.
     */
    public static Specification<CardTransaction> dateFrom(LocalDate from) {
        return (root, q, cb) -> from == null
                ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("usedDate"), from);
    }

    /**
     * 사용 일자 종료일 조건.
     */
    public static Specification<CardTransaction> dateTo(LocalDate to) {
        return (root, q, cb) -> to == null
                ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.get("usedDate"), to);
    }
}
