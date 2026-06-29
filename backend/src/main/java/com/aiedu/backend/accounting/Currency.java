package com.aiedu.backend.accounting;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * 통화(Currency). 다통화 지원을 위한 통화 마스터 엔티티.
 * ISO 4217 코드(3자리)를 기본 키로 사용.
 */
@Entity
@Table(name = "currency")
public class Currency {

    /** ISO 4217 통화 코드(기본 키). 예: "KRW", "USD". */
    @Id
    @Column(length = 3)
    private String code;

    /** 통화 이름(필수). */
    @Column(nullable = false, length = 100)
    private String name;

    /** 통화 기호. 예: "₩", "$". */
    @Column(length = 10)
    private String symbol;

    /** 소수 자리수. 기본값 2. */
    @Column(nullable = false)
    private int decimals = 2;

    /** 활성 여부. 기본값 true. */
    @Column(nullable = false)
    private boolean active = true;

    protected Currency() {
    }

    private Currency(String code, String name, String symbol, int decimals) {
        this.code = code;
        this.name = name;
        this.symbol = symbol;
        this.decimals = decimals;
    }

    /** 통화를 생성합니다. */
    public static Currency create(String code, String name, String symbol, int decimals) {
        return new Currency(code, name, symbol, decimals);
    }

    /** 통화를 갱신합니다(코드는 불변). */
    public void update(String name, String symbol, boolean active) {
        this.name = name;
        this.symbol = symbol;
        this.active = active;
    }

    public String getCode() { return code; }
    public String getName() { return name; }
    public String getSymbol() { return symbol; }
    public int getDecimals() { return decimals; }
    public boolean isActive() { return active; }
}
