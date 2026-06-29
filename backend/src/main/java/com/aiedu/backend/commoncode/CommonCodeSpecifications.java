package com.aiedu.backend.commoncode;

import org.springframework.data.jpa.domain.Specification;

/** 공통코드 동적 검색 조건. */
public final class CommonCodeSpecifications {

    private CommonCodeSpecifications() {
    }

    /** code, name 또는 description 키워드 like 검색. */
    public static Specification<CommonCode> keyword(String kw) {
        return (root, q, cb) -> {
            if (kw == null || kw.isBlank()) return cb.conjunction();
            String like = "%" + kw.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("code")), like),
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("description")), like));
        };
    }

    /** 코드 그룹 일치. */
    public static Specification<CommonCode> codeGroupEquals(String codeGroup) {
        return (root, q, cb) -> (codeGroup == null || codeGroup.isBlank()) ? cb.conjunction()
                : cb.equal(root.get("codeGroup"), codeGroup);
    }

    /** 사용 여부 일치. */
    public static Specification<CommonCode> useYnEquals(Boolean useYn) {
        return (root, q, cb) -> useYn == null ? cb.conjunction()
                : cb.equal(root.get("useYn"), useYn);
    }
}
