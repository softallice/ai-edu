package com.aiedu.backend.pm;

import org.springframework.data.jpa.domain.Specification;

/** 예산대실적 동적 검색 조건. */
public final class BudgetSpecifications {
    private BudgetSpecifications() {}

    /**
     * 코드 또는 예산항목 키워드 검색.
     *
     * @param kw 검색 키워드
     */
    public static Specification<Budget> keyword(String kw) {
        return (root, q, cb) -> {
            if (kw == null || kw.isBlank()) return cb.conjunction();
            String like = "%" + kw.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("code")), like),
                    cb.like(cb.lower(root.get("category")), like));
        };
    }

    /**
     * 예산 유형 일치 조건.
     *
     * @param budgetType 예산 유형(null이면 전체)
     */
    public static Specification<Budget> budgetTypeEquals(BudgetType budgetType) {
        return (root, q, cb) -> budgetType == null ? cb.conjunction()
                : cb.equal(root.get("budgetType"), budgetType);
    }

    /**
     * 부서 id 일치 조건.
     *
     * @param departmentId 부서 id(null이면 전체)
     */
    public static Specification<Budget> departmentEquals(Long departmentId) {
        return (root, q, cb) -> departmentId == null ? cb.conjunction()
                : cb.equal(root.get("department").get("id"), departmentId);
    }

    /**
     * 프로젝트 id 일치 조건.
     *
     * @param projectId 프로젝트 id(null이면 전체)
     */
    public static Specification<Budget> projectEquals(Long projectId) {
        return (root, q, cb) -> projectId == null ? cb.conjunction()
                : cb.equal(root.get("project").get("id"), projectId);
    }

    /**
     * 회계연도 일치 조건.
     *
     * @param fiscalYear 회계연도(null이면 전체)
     */
    public static Specification<Budget> fiscalYearEquals(Integer fiscalYear) {
        return (root, q, cb) -> fiscalYear == null ? cb.conjunction()
                : cb.equal(root.get("fiscalYear"), fiscalYear);
    }
}
