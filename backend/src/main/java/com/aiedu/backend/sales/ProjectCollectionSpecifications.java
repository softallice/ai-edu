package com.aiedu.backend.sales;

import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;

/** 프로젝트수금 동적 검색 조건. */
public final class ProjectCollectionSpecifications {
    private ProjectCollectionSpecifications() {}

    public static Specification<ProjectCollection> keyword(String kw) {
        return (root, q, cb) -> {
            if (kw == null || kw.isBlank()) return cb.conjunction();
            String like = "%" + kw.trim().toLowerCase() + "%";
            return cb.like(cb.lower(root.get("code")), like);
        };
    }

    public static Specification<ProjectCollection> statusEquals(CollectionStatus status) {
        return (root, q, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<ProjectCollection> customerEquals(Long customerId) {
        return (root, q, cb) -> customerId == null ? cb.conjunction()
                : cb.equal(root.get("customer").get("id"), customerId);
    }

    public static Specification<ProjectCollection> dateFrom(LocalDate from) {
        return (root, q, cb) -> from == null ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("plannedDate"), from);
    }

    public static Specification<ProjectCollection> dateTo(LocalDate to) {
        return (root, q, cb) -> to == null ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.get("plannedDate"), to);
    }
}
