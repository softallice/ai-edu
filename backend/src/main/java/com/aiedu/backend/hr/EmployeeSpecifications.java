package com.aiedu.backend.hr;

import org.springframework.data.jpa.domain.Specification;

/** 직원 동적 검색 조건. */
public final class EmployeeSpecifications {
    private EmployeeSpecifications() {}

    public static Specification<Employee> keyword(String kw) {
        return (root, q, cb) -> {
            if (kw == null || kw.isBlank()) return cb.conjunction();
            String like = "%" + kw.trim().toLowerCase() + "%";
            return cb.or(cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("employeeNo")), like));
        };
    }

    public static Specification<Employee> departmentEquals(Long departmentId) {
        return (root, q, cb) -> departmentId == null ? cb.conjunction()
                : cb.equal(root.get("department").get("id"), departmentId);
    }

    public static Specification<Employee> activeEquals(Boolean active) {
        return (root, q, cb) -> active == null ? cb.conjunction() : cb.equal(root.get("active"), active);
    }
}
