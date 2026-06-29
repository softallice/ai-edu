package com.aiedu.backend.pm;

import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;

/** 활동시간 동적 검색 조건. */
public final class TimesheetSpecifications {
    private TimesheetSpecifications() {}

    public static Specification<Timesheet> employeeEquals(Long employeeId) {
        return (root, q, cb) -> employeeId == null ? cb.conjunction()
                : cb.equal(root.get("employee").get("id"), employeeId);
    }

    public static Specification<Timesheet> projectEquals(Long projectId) {
        return (root, q, cb) -> projectId == null ? cb.conjunction()
                : cb.equal(root.get("project").get("id"), projectId);
    }

    public static Specification<Timesheet> dateFrom(LocalDate from) {
        return (root, q, cb) -> from == null ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("workDate"), from);
    }

    public static Specification<Timesheet> dateTo(LocalDate to) {
        return (root, q, cb) -> to == null ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.get("workDate"), to);
    }

    public static Specification<Timesheet> validatedEquals(Boolean validated) {
        return (root, q, cb) -> validated == null ? cb.conjunction() : cb.equal(root.get("validated"), validated);
    }
}
