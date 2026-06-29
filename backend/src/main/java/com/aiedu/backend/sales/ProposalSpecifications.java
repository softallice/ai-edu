package com.aiedu.backend.sales;

import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;

/** 제안내역 동적 검색 조건. */
public final class ProposalSpecifications {
    private ProposalSpecifications() {}

    public static Specification<Proposal> keyword(String kw) {
        return (root, q, cb) -> {
            if (kw == null || kw.isBlank()) return cb.conjunction();
            String like = "%" + kw.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("code")), like),
                    cb.like(cb.lower(root.get("title")), like));
        };
    }

    public static Specification<Proposal> statusEquals(ProposalStatus status) {
        return (root, q, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<Proposal> customerEquals(Long customerId) {
        return (root, q, cb) -> customerId == null ? cb.conjunction()
                : cb.equal(root.get("customer").get("id"), customerId);
    }

    public static Specification<Proposal> dateFrom(LocalDate from) {
        return (root, q, cb) -> from == null ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("proposalDate"), from);
    }

    public static Specification<Proposal> dateTo(LocalDate to) {
        return (root, q, cb) -> to == null ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.get("proposalDate"), to);
    }
}
