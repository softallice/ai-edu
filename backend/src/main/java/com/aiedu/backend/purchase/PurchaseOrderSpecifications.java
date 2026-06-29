package com.aiedu.backend.purchase;

import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;

/** 구매발주 동적 검색 조건. */
public final class PurchaseOrderSpecifications {
    private PurchaseOrderSpecifications() {}

    /** 발주번호 키워드 LIKE 검색. */
    public static Specification<PurchaseOrder> keyword(String kw) {
        return (root, q, cb) -> {
            if (kw == null || kw.isBlank()) return cb.conjunction();
            String like = "%" + kw.trim().toLowerCase() + "%";
            return cb.like(cb.lower(root.get("code")), like);
        };
    }

    /** 상태 일치 검색. */
    public static Specification<PurchaseOrder> statusEquals(PurchaseOrderStatus status) {
        return (root, q, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    /** 공급처(거래처) ID 일치 검색. */
    public static Specification<PurchaseOrder> supplierEquals(Long supplierId) {
        return (root, q, cb) -> supplierId == null ? cb.conjunction()
                : cb.equal(root.get("supplier").get("id"), supplierId);
    }

    /** 발주일 시작 범위. */
    public static Specification<PurchaseOrder> dateFrom(LocalDate from) {
        return (root, q, cb) -> from == null ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("orderDate"), from);
    }

    /** 발주일 종료 범위. */
    public static Specification<PurchaseOrder> dateTo(LocalDate to) {
        return (root, q, cb) -> to == null ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.get("orderDate"), to);
    }
}
