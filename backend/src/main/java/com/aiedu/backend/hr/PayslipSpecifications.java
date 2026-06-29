package com.aiedu.backend.hr;

import org.springframework.data.jpa.domain.Specification;

/** 급여명세 동적 검색 조건. */
public final class PayslipSpecifications {
    private PayslipSpecifications() {}

    /** 코드 키워드(LIKE). */
    public static Specification<Payslip> keyword(String keyword) {
        return (root, q, cb) -> (keyword == null || keyword.isBlank()) ? cb.conjunction()
                : cb.like(root.get("code"), "%" + keyword.trim() + "%");
    }

    /** 상태 일치. */
    public static Specification<Payslip> statusEquals(PayslipStatus status) {
        return (root, q, cb) -> status == null ? cb.conjunction()
                : cb.equal(root.get("status"), status);
    }

    /** 직원 ID 일치. */
    public static Specification<Payslip> employeeEquals(Long employeeId) {
        return (root, q, cb) -> employeeId == null ? cb.conjunction()
                : cb.equal(root.get("employee").get("id"), employeeId);
    }

    /** 귀속월 일치(YYYY-MM). */
    public static Specification<Payslip> payMonthEquals(String payMonth) {
        return (root, q, cb) -> (payMonth == null || payMonth.isBlank()) ? cb.conjunction()
                : cb.equal(root.get("payMonth"), payMonth.trim());
    }

    /** 귀속월 이상(문자열 비교). */
    public static Specification<Payslip> payMonthFrom(String from) {
        return (root, q, cb) -> (from == null || from.isBlank()) ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("payMonth"), from.trim());
    }

    /** 귀속월 이하(문자열 비교). */
    public static Specification<Payslip> payMonthTo(String to) {
        return (root, q, cb) -> (to == null || to.isBlank()) ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.get("payMonth"), to.trim());
    }
}
