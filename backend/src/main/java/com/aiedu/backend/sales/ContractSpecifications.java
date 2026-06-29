package com.aiedu.backend.sales;

import org.springframework.data.jpa.domain.Specification;

/** 계약 동적 검색 조건. */
public final class ContractSpecifications {
    private ContractSpecifications() {}

    public static Specification<Contract> keyword(String kw) {
        return (root, q, cb) -> {
            if (kw == null || kw.isBlank()) return cb.conjunction();
            String like = "%" + kw.trim().toLowerCase() + "%";
            return cb.or(cb.like(cb.lower(root.get("name")), like), cb.like(cb.lower(root.get("code")), like));
        };
    }

    public static Specification<Contract> stateEquals(ContractState state) {
        return (root, q, cb) -> state == null ? cb.conjunction() : cb.equal(root.get("state"), state);
    }

    public static Specification<Contract> customerEquals(Long customerId) {
        return (root, q, cb) -> customerId == null ? cb.conjunction()
                : cb.equal(root.get("customer").get("id"), customerId);
    }

    public static Specification<Contract> activeEquals(Boolean active) {
        return (root, q, cb) -> active == null ? cb.conjunction() : cb.equal(root.get("active"), active);
    }
}
