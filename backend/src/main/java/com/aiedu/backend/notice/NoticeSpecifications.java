package com.aiedu.backend.notice;

import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;

/** 공지 동적 검색 조건. */
public final class NoticeSpecifications {
    private NoticeSpecifications() {}

    /** title 또는 content 에서 키워드 like 검색. */
    public static Specification<Notice> keyword(String kw) {
        return (root, q, cb) -> {
            if (kw == null || kw.isBlank()) return cb.conjunction();
            String like = "%" + kw.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("title")), like),
                    cb.like(cb.lower(root.get("content")), like));
        };
    }

    public static Specification<Notice> categoryEquals(NoticeCategory category) {
        return (root, q, cb) -> category == null ? cb.conjunction()
                : cb.equal(root.get("category"), category);
    }

    public static Specification<Notice> dateFrom(LocalDate from) {
        return (root, q, cb) -> from == null ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("postedDate"), from);
    }

    public static Specification<Notice> dateTo(LocalDate to) {
        return (root, q, cb) -> to == null ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.get("postedDate"), to);
    }
}
