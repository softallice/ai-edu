package com.aiedu.backend.accounting;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * 세금(Tax). 세금 마스터 엔티티.
 * 비율({@link TaxAmountType#PERCENT}) 또는 고정액({@link TaxAmountType#FIXED})으로 계산.
 */
@Entity
@Table(name = "tax")
public class Tax {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 세금 이름(필수). */
    @Column(nullable = false, length = 100)
    private String name;

    /** 세금 코드. 유일. */
    @Column(unique = true, length = 30)
    private String code;

    /** 세금 금액 유형. 기본값 PERCENT. */
    @Enumerated(EnumType.STRING)
    @Column(name = "amount_type", nullable = false, length = 10)
    private TaxAmountType amountType = TaxAmountType.PERCENT;

    /** 세금 금액(비율 또는 고정액). 기본값 0. */
    @Column(nullable = false)
    private double amount = 0;

    /** 가격 포함 여부. 기본값 false. */
    @Column(name = "price_include", nullable = false)
    private boolean priceInclude = false;

    /** 세금 적용 방향. 기본값 SALE. */
    @Enumerated(EnumType.STRING)
    @Column(name = "type_tax_use", nullable = false, length = 10)
    private TaxUse typeTaxUse = TaxUse.SALE;

    /** 활성 여부. 기본값 true. */
    @Column(nullable = false)
    private boolean active = true;

    /** 정렬 순서. 기본값 10. */
    @Column(nullable = false)
    private int sequence = 10;

    /** 소속 세금 그룹. 선택. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private TaxGroup group;

    protected Tax() {
    }

    private Tax(String code, String name, TaxAmountType amountType, double amount,
            TaxUse typeTaxUse, TaxGroup group) {
        this.code = code;
        this.name = name;
        this.amountType = amountType;
        this.amount = amount;
        this.typeTaxUse = typeTaxUse;
        this.group = group;
    }

    /** 세금을 생성합니다. */
    public static Tax create(String code, String name, TaxAmountType amountType, double amount,
            TaxUse typeTaxUse, TaxGroup group) {
        return new Tax(code, name, amountType, amount, typeTaxUse, group);
    }

    /** 세금을 갱신합니다(코드는 불변). */
    public void update(String name, TaxAmountType amountType, double amount, boolean active) {
        this.name = name;
        this.amountType = amountType;
        this.amount = amount;
        this.active = active;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCode() { return code; }
    public TaxAmountType getAmountType() { return amountType; }
    public double getAmount() { return amount; }
    public boolean isPriceInclude() { return priceInclude; }
    public TaxUse getTypeTaxUse() { return typeTaxUse; }
    public boolean isActive() { return active; }
    public int getSequence() { return sequence; }
    public TaxGroup getGroup() { return group; }
}
