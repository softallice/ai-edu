package com.aiedu.backend.eval;

import org.springframework.data.jpa.domain.Specification;

/** 업적목표 동적 검색 조건. */
public final class EvalGoalSpecifications {
    private EvalGoalSpecifications() {}

    /** code 또는 title 키워드 like 검색. */
    public static Specification<EvalGoal> keyword(String kw) {
        return (root, q, cb) -> {
            if (kw == null || kw.isBlank()) return cb.conjunction();
            String like = "%" + kw.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("code")), like),
                    cb.like(cb.lower(root.get("title")), like));
        };
    }

    /** 직원 ID 일치 검색. */
    public static Specification<EvalGoal> employeeEquals(Long employeeId) {
        return (root, q, cb) -> employeeId == null ? cb.conjunction()
                : cb.equal(root.get("employee").get("id"), employeeId);
    }

    /** 상태 일치 검색. */
    public static Specification<EvalGoal> statusEquals(EvalGoalStatus status) {
        return (root, q, cb) -> status == null ? cb.conjunction()
                : cb.equal(root.get("status"), status);
    }

    /** 평가기간 일치 검색(String 완전 일치). */
    public static Specification<EvalGoal> periodEquals(String period) {
        return (root, q, cb) -> (period == null || period.isBlank()) ? cb.conjunction()
                : cb.equal(root.get("period"), period.trim());
    }
}
