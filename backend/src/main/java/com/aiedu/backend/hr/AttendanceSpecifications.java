package com.aiedu.backend.hr;

import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;

/** 근태 동적 검색 조건. */
public final class AttendanceSpecifications {
    private AttendanceSpecifications() {}

    /** 직원 ID 일치. */
    public static Specification<Attendance> employeeEquals(Long employeeId) {
        return (root, q, cb) -> employeeId == null ? cb.conjunction()
                : cb.equal(root.get("employee").get("id"), employeeId);
    }

    /** 상태 일치. */
    public static Specification<Attendance> statusEquals(AttendanceStatus status) {
        return (root, q, cb) -> status == null ? cb.conjunction()
                : cb.equal(root.get("status"), status);
    }

    /** 근무일 시작(이상). */
    public static Specification<Attendance> dateFrom(LocalDate from) {
        return (root, q, cb) -> from == null ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("workDate"), from);
    }

    /** 근무일 종료(이하). */
    public static Specification<Attendance> dateTo(LocalDate to) {
        return (root, q, cb) -> to == null ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.get("workDate"), to);
    }
}
