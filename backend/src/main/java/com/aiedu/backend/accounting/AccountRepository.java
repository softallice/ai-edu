package com.aiedu.backend.accounting;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/** 계정과목 레포지토리. */
public interface AccountRepository extends JpaRepository<Account, Long>, JpaSpecificationExecutor<Account> {
    List<Account> findByCodeIn(Collection<String> codes);
    boolean existsByCode(String code);
}
