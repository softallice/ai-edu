package com.aiedu.backend.sales;

import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;

/** 세금계산서 동적 검색 조건. */
public final class TaxInvoiceSpecifications {
    private TaxInvoiceSpecifications() {}

    public static Specification<TaxInvoice> keyword(String kw) {
        return (root, q, cb) -> {
            if (kw == null || kw.isBlank()) return cb.conjunction();
            String like = "%" + kw.trim().toLowerCase() + "%";
            return cb.like(cb.lower(root.get("code")), like);
        };
    }

    public static Specification<TaxInvoice> statusEquals(TaxInvoiceStatus status) {
        return (root, q, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<TaxInvoice> customerEquals(Long customerId) {
        return (root, q, cb) -> customerId == null ? cb.conjunction()
                : cb.equal(root.get("customer").get("id"), customerId);
    }

    public static Specification<TaxInvoice> dateFrom(LocalDate from) {
        return (root, q, cb) -> from == null ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("issueDate"), from);
    }

    public static Specification<TaxInvoice> dateTo(LocalDate to) {
        return (root, q, cb) -> to == null ? cb.conjunction() : cb.lessThanOrEqualTo(root.get("issueDate"), to);
    }
}
