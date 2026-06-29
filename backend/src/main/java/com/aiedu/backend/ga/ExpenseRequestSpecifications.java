package com.aiedu.backend.ga;

import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;

/** 지출품의 동적 검색 조건. */
public final class ExpenseRequestSpecifications {

    private ExpenseRequestSpecifications() {
    }

    /** code 또는 title 키워드 검색. */
    public static Specification<ExpenseRequest> keyword(String kw) {
        return (root, q, cb) -> {
            if (kw == null || kw.isBlank()) return cb.conjunction();
            String like = "%" + kw.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("code")), like),
                    cb.like(cb.lower(root.get("title")), like));
        };
    }

    /** 신청자 직원 ID 일치. */
    public static Specification<ExpenseRequest> employeeEquals(Long employeeId) {
        return (root, q, cb) -> employeeId == null ? cb.conjunction()
                : cb.equal(root.get("employee").get("id"), employeeId);
    }

    /** 비용유형 일치. */
    public static Specification<ExpenseRequest> typeEquals(ExpenseType expenseType) {
        return (root, q, cb) -> expenseType == null ? cb.conjunction()
                : cb.equal(root.get("expenseType"), expenseType);
    }

    /** 처리상태 일치. */
    public static Specification<ExpenseRequest> statusEquals(ExpenseStatus status) {
        return (root, q, cb) -> status == null ? cb.conjunction()
                : cb.equal(root.get("status"), status);
    }

    /** 신청일 시작. */
    public static Specification<ExpenseRequest> dateFrom(LocalDate from) {
        return (root, q, cb) -> from == null ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("requestDate"), from);
    }

    /** 신청일 종료. */
    public static Specification<ExpenseRequest> dateTo(LocalDate to) {
        return (root, q, cb) -> to == null ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.get("requestDate"), to);
    }
}
