package com.aiedu.backend.sales;

import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;

/** 구매의뢰 동적 검색 조건. */
public final class PurchaseRequestSpecifications {
    private PurchaseRequestSpecifications() {}

    public static Specification<PurchaseRequest> keyword(String kw) {
        return (root, q, cb) -> {
            if (kw == null || kw.isBlank()) return cb.conjunction();
            String like = "%" + kw.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("code")), like),
                    cb.like(cb.lower(root.get("itemName")), like));
        };
    }

    public static Specification<PurchaseRequest> statusEquals(PurchaseRequestStatus status) {
        return (root, q, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<PurchaseRequest> dateFrom(LocalDate from) {
        return (root, q, cb) -> from == null ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("requestDate"), from);
    }

    public static Specification<PurchaseRequest> dateTo(LocalDate to) {
        return (root, q, cb) -> to == null ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.get("requestDate"), to);
    }
}
