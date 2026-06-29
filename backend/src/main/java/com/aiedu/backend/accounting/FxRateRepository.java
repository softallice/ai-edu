package com.aiedu.backend.accounting;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** 환율 레포지토리. */
public interface FxRateRepository extends JpaRepository<FxRate, Long> {
    List<FxRate> findByCurrencyCodeOrderByRateDateDesc(String currencyCode);
}
