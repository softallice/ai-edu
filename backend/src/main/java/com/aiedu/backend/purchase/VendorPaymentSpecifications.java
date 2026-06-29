package com.aiedu.backend.purchase;

import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;

/** 구매대금지급 동적 검색 조건. */
public final class VendorPaymentSpecifications {
    private VendorPaymentSpecifications() {}

    public static Specification<VendorPayment> keyword(String kw) {
        return (root, q, cb) -> {
            if (kw == null || kw.isBlank()) return cb.conjunction();
            String like = "%" + kw.trim().toLowerCase() + "%";
            return cb.like(cb.lower(root.get("code")), like);
        };
    }

    public static Specification<VendorPayment> statusEquals(VendorPaymentStatus status) {
        return (root, q, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<VendorPayment> supplierEquals(Long supplierId) {
        return (root, q, cb) -> supplierId == null ? cb.conjunction()
                : cb.equal(root.get("supplier").get("id"), supplierId);
    }

    public static Specification<VendorPayment> dateFrom(LocalDate from) {
        return (root, q, cb) -> from == null ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("paymentDate"), from);
    }

    public static Specification<VendorPayment> dateTo(LocalDate to) {
        return (root, q, cb) -> to == null ? cb.conjunction() : cb.lessThanOrEqualTo(root.get("paymentDate"), to);
    }
}
