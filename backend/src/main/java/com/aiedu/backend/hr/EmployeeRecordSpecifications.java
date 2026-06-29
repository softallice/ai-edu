package com.aiedu.backend.hr;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

/** 인적사항 동적 검색 조건. */
public final class EmployeeRecordSpecifications {
    private EmployeeRecordSpecifications() {}

    /** 코드/title/organization 키워드(LIKE OR). */
    public static Specification<EmployeeRecord> keyword(String keyword) {
        return (root, q, cb) -> {
            if (keyword == null || keyword.isBlank()) return cb.conjunction();
            String pattern = "%" + keyword.trim() + "%";
            return cb.or(
                    cb.like(root.get("code"), pattern),
                    cb.like(root.get("title"), pattern),
                    cb.like(root.get("organization"), pattern));
        };
    }

    /** 유형 일치. */
    public static Specification<EmployeeRecord> typeEquals(EmployeeRecordType recordType) {
        return (root, q, cb) -> recordType == null ? cb.conjunction()
                : cb.equal(root.get("recordType"), recordType);
    }

    /** 유형 목록(학력·경력 그룹 / 업무이력 그룹 필터용). */
    public static Specification<EmployeeRecord> typeIn(List<EmployeeRecordType> types) {
        return (root, q, cb) -> (types == null || types.isEmpty()) ? cb.conjunction()
                : root.get("recordType").in(types);
    }

    /** 직원 ID 일치. */
    public static Specification<EmployeeRecord> employeeEquals(Long employeeId) {
        return (root, q, cb) -> employeeId == null ? cb.conjunction()
                : cb.equal(root.get("employee").get("id"), employeeId);
    }

    /** 시작일 이상. */
    public static Specification<EmployeeRecord> dateFrom(LocalDate from) {
        return (root, q, cb) -> from == null ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("startDate"), from);
    }

    /** 시작일 이하. */
    public static Specification<EmployeeRecord> dateTo(LocalDate to) {
        return (root, q, cb) -> to == null ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.get("startDate"), to);
    }
}
