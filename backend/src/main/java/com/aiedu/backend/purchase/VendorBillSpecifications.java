package com.aiedu.backend.purchase;

import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;

/** 매입세금계산서 동적 검색 조건. */
public final class VendorBillSpecifications {
    private VendorBillSpecifications() {}

    public static Specification<VendorBill> keyword(String kw) {
        return (root, q, cb) -> {
            if (kw == null || kw.isBlank()) return cb.conjunction();
            String like = "%" + kw.trim().toLowerCase() + "%";
            return cb.like(cb.lower(root.get("code")), like);
        };
    }

    public static Specification<VendorBill> statusEquals(VendorBillStatus status) {
        return (root, q, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<VendorBill> supplierEquals(Long supplierId) {
        return (root, q, cb) -> supplierId == null ? cb.conjunction()
                : cb.equal(root.get("supplier").get("id"), supplierId);
    }

    public static Specification<VendorBill> typeEquals(VendorBillType billType) {
        return (root, q, cb) -> billType == null ? cb.conjunction() : cb.equal(root.get("billType"), billType);
    }

    public static Specification<VendorBill> dateFrom(LocalDate from) {
        return (root, q, cb) -> from == null ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("issueDate"), from);
    }

    public static Specification<VendorBill> dateTo(LocalDate to) {
        return (root, q, cb) -> to == null ? cb.conjunction() : cb.lessThanOrEqualTo(root.get("issueDate"), to);
    }
}
