package com.aiedu.backend.accounting;

import org.springframework.data.jpa.repository.JpaRepository;

/** 통화 레포지토리. */
public interface CurrencyRepository extends JpaRepository<Currency, String> {
}
