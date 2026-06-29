package com.aiedu.backend.accounting;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 환율(FxRate). 통화별 일자 환율 마스터 엔티티.
 * (currency_code, rate_date) 쌍은 유일.
 */
@Entity
@Table(name = "fx_rate", uniqueConstraints = @UniqueConstraint(columnNames = {"currency_code", "rate_date"}))
public class FxRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 통화 코드(ISO 4217). */
    @Column(name = "currency_code", length = 3)
    private String currencyCode;

    /** 통화 엔티티 참조(읽기 전용 조인). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "currency_code", insertable = false, updatable = false)
    private Currency currency;

    /** 환율 적용 일자(필수). */
    @Column(name = "rate_date", nullable = false)
    private LocalDate rateDate;

    /** 환율(필수). precision=18, scale=8. */
    @Column(nullable = false, precision = 18, scale = 8)
    private BigDecimal rate;

    protected FxRate() {
    }

    private FxRate(String currencyCode, LocalDate rateDate, BigDecimal rate) {
        this.currencyCode = currencyCode;
        this.rateDate = rateDate;
        this.rate = rate;
    }

    /** 환율을 생성합니다. */
    public static FxRate create(String currencyCode, LocalDate rateDate, BigDecimal rate) {
        return new FxRate(currencyCode, rateDate, rate);
    }

    public Long getId() { return id; }
    public String getCurrencyCode() { return currencyCode; }
    public Currency getCurrency() { return currency; }
    public LocalDate getRateDate() { return rateDate; }
    public BigDecimal getRate() { return rate; }
}
