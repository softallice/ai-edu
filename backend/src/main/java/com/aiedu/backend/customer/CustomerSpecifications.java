package com.aiedu.backend.customer;

import org.springframework.data.jpa.domain.Specification;

/**
 * 거래처 동적 검색 조건(JPA Criteria 술어).
 *
 * <p>레거시 POVM0001 SEARCH00 의 MyBatis {@code <if>} 동적 SQL 을 타입 안전한 Specification 으로
 * 옮긴 것입니다. 각 메서드는 인자가 비면 "항상 참(conjunction)"을 반환해 필터를 생략합니다.
 */
public final class CustomerSpecifications {

    private CustomerSpecifications() {
    }

    /** 거래처코드 또는 거래처명에 키워드가 포함(대소문자 무시). 레거시 CUST_CD_AND_NM. */
    public static Specification<Customer> keywordContains(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return cb.conjunction();
            }
            // 사용자 입력의 LIKE 와일드카드(%, _)를 리터럴로 처리하기 위해 이스케이프합니다.
            String escaped = keyword.trim().toLowerCase()
                    .replace("\\", "\\\\")
                    .replace("%", "\\%")
                    .replace("_", "\\_");
            String like = "%" + escaped + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("code")), like, '\\'),
                    cb.like(cb.lower(root.get("name")), like, '\\'));
        };
    }

    /** 사용여부 일치. 레거시 TRAN_EN_YN. */
    public static Specification<Customer> activeEquals(Boolean active) {
        return (root, query, cb) ->
                active == null ? cb.conjunction() : cb.equal(root.get("active"), active);
    }

    /** 매입매출구분 일치. 레거시 BUY_SALE_GB. */
    public static Specification<Customer> tradeTypeEquals(TradeType tradeType) {
        return (root, query, cb) ->
                tradeType == null ? cb.conjunction() : cb.equal(root.get("tradeType"), tradeType);
    }
}
