package com.aiedu.backend.hr;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

/** 휴가/근로신청 동적 검색 조건. */
public final class LeaveRequestSpecifications {
    private LeaveRequestSpecifications() {}

    /** 코드 키워드(LIKE). */
    public static Specification<LeaveRequest> keyword(String keyword) {
        return (root, q, cb) -> (keyword == null || keyword.isBlank()) ? cb.conjunction()
                : cb.like(root.get("code"), "%" + keyword.trim() + "%");
    }

    /** 신청 유형 일치. */
    public static Specification<LeaveRequest> typeEquals(LeaveRequestType requestType) {
        return (root, q, cb) -> requestType == null ? cb.conjunction()
                : cb.equal(root.get("requestType"), requestType);
    }

    /** 신청 유형 목록(휴가류/근로류 그룹 필터용). */
    public static Specification<LeaveRequest> typeIn(List<LeaveRequestType> types) {
        return (root, q, cb) -> (types == null || types.isEmpty()) ? cb.conjunction()
                : root.get("requestType").in(types);
    }

    /** 상태 일치. */
    public static Specification<LeaveRequest> statusEquals(LeaveRequestStatus status) {
        return (root, q, cb) -> status == null ? cb.conjunction()
                : cb.equal(root.get("status"), status);
    }

    /** 직원 ID 일치. */
    public static Specification<LeaveRequest> employeeEquals(Long employeeId) {
        return (root, q, cb) -> employeeId == null ? cb.conjunction()
                : cb.equal(root.get("employee").get("id"), employeeId);
    }

    /** 시작일 시작(이상). */
    public static Specification<LeaveRequest> dateFrom(LocalDate from) {
        return (root, q, cb) -> from == null ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("startDate"), from);
    }

    /** 시작일 종료(이하). */
    public static Specification<LeaveRequest> dateTo(LocalDate to) {
        return (root, q, cb) -> to == null ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.get("startDate"), to);
    }
}
