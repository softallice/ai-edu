package com.aiedu.backend.customer;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

/**
 * 거래처 영속성 계층. Spring Data JPA 가 구현체를 자동 생성합니다.
 *
 * <p>{@link JpaSpecificationExecutor} 를 함께 상속해 동적 조건 검색을 지원합니다. 이는 레거시
 * POVM0001 의 MyBatis 동적 SQL(SEARCH00 의 {@code <where><if>} 조건부 필터)을 모던하게
 * 대체하는 방식입니다 — 필터가 있을 때만 술어(predicate)가 추가되므로, 모든 조건이 비어도
 * 안전합니다(특히 PostgreSQL 에서 null 바인드 파라미터의 타입 추론 문제를 피합니다).
 */
public interface CustomerRepository
        extends JpaRepository<Customer, Long>, JpaSpecificationExecutor<Customer> {

    /** 사업자번호 중복 여부(생성 시). 레거시 SEARCH03 대응. */
    boolean existsByBusinessRegNo(String businessRegNo);

    /** 사업자번호 중복 여부(수정 시 자기 자신 제외). 레거시 SEARCH03 의 {@code CUST_CODE != #{CUST_CODE}} 대응. */
    boolean existsByBusinessRegNoAndIdNot(String businessRegNo, Long id);

    /** 채번용 현재 최대 거래처코드. 레거시 INSERT00 의 selectKey(MAX(CUST_CODE)+1) 대응. */
    @Query("select max(c.code) from Customer c")
    Optional<String> findMaxCode();
}
