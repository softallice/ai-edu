package com.aiedu.backend.ga;

import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;

/** 인감신청 동적 검색 조건. */
public final class SealRequestSpecifications {

    private SealRequestSpecifications() {
    }

    /** code 또는 title 키워드 검색. */
    public static Specification<SealRequest> keyword(String kw) {
        return (root, q, cb) -> {
            if (kw == null || kw.isBlank()) return cb.conjunction();
            String like = "%" + kw.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("code")), like),
                    cb.like(cb.lower(root.get("title")), like));
        };
    }

    /** 신청자 직원 ID 일치. */
    public static Specification<SealRequest> employeeEquals(Long employeeId) {
        return (root, q, cb) -> employeeId == null ? cb.conjunction()
                : cb.equal(root.get("employee").get("id"), employeeId);
    }

    /** 인감 종류 일치. */
    public static Specification<SealRequest> typeEquals(SealType sealType) {
        return (root, q, cb) -> sealType == null ? cb.conjunction()
                : cb.equal(root.get("sealType"), sealType);
    }

    /** 처리상태 일치. */
    public static Specification<SealRequest> statusEquals(SealStatus status) {
        return (root, q, cb) -> status == null ? cb.conjunction()
                : cb.equal(root.get("status"), status);
    }

    /** 사용예정일 시작. */
    public static Specification<SealRequest> dateFrom(LocalDate from) {
        return (root, q, cb) -> from == null ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("useDate"), from);
    }

    /** 사용예정일 종료. */
    public static Specification<SealRequest> dateTo(LocalDate to) {
        return (root, q, cb) -> to == null ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.get("useDate"), to);
    }
}
