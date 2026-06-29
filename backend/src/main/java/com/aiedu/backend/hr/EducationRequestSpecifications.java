package com.aiedu.backend.hr;

import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;

/** 교육신청 동적 검색 조건. */
public final class EducationRequestSpecifications {
    private EducationRequestSpecifications() {}

    /** 코드·교육명·기관 키워드(LIKE). */
    public static Specification<EducationRequest> keyword(String keyword) {
        return (root, q, cb) -> {
            if (keyword == null || keyword.isBlank()) return cb.conjunction();
            String pattern = "%" + keyword.trim() + "%";
            return cb.or(
                    cb.like(root.get("code"), pattern),
                    cb.like(root.get("title"), pattern),
                    cb.like(root.get("institution"), pattern));
        };
    }

    /** 교육 유형 일치. */
    public static Specification<EducationRequest> eduTypeEquals(EducationType eduType) {
        return (root, q, cb) -> eduType == null ? cb.conjunction()
                : cb.equal(root.get("eduType"), eduType);
    }

    /** 상태 일치. */
    public static Specification<EducationRequest> statusEquals(EducationStatus status) {
        return (root, q, cb) -> status == null ? cb.conjunction()
                : cb.equal(root.get("status"), status);
    }

    /** 직원 ID 일치. */
    public static Specification<EducationRequest> employeeEquals(Long employeeId) {
        return (root, q, cb) -> employeeId == null ? cb.conjunction()
                : cb.equal(root.get("employee").get("id"), employeeId);
    }

    /** 시작일 시작(이상). */
    public static Specification<EducationRequest> dateFrom(LocalDate from) {
        return (root, q, cb) -> from == null ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("startDate"), from);
    }

    /** 시작일 종료(이하). */
    public static Specification<EducationRequest> dateTo(LocalDate to) {
        return (root, q, cb) -> to == null ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.get("startDate"), to);
    }
}
