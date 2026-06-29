package com.aiedu.backend.sales;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;

/**
 * 계약 품목(ContractLine). koerp {@code ContractLine} 이관.
 * {@link Contract} 애그리거트의 자식으로, 생애주기는 계약을 통해서만 관리합니다.
 */
@Entity
@Table(name = "contract_lines")
public class ContractLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    /** 품목명. */
    @Column(name = "item_name", nullable = false, length = 200)
    private String itemName;

    /** 규격/사양. */
    @Column(length = 200)
    private String spec;

    @Column(nullable = false, precision = 16, scale = 2)
    private BigDecimal quantity = BigDecimal.ONE;

    @Column(name = "unit_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    /** 금액(= 수량 × 단가). 생성/수정 시 계산해 저장. */
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(length = 300)
    private String remark;

    protected ContractLine() {
    }

    private ContractLine(String itemName, String spec, BigDecimal quantity, BigDecimal unitPrice, String remark) {
        this.itemName = itemName;
        this.spec = spec;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.amount = quantity.multiply(unitPrice);
        this.remark = remark;
    }

    public static ContractLine create(String itemName, String spec, BigDecimal quantity, BigDecimal unitPrice,
            String remark) {
        return new ContractLine(itemName, spec, quantity, unitPrice, remark);
    }

    /** 양방향 연관관계의 주인 설정. {@link Contract#addLine} 에서 호출. */
    void assignTo(Contract contract) {
        this.contract = contract;
    }

    public Long getId() { return id; }
    public String getItemName() { return itemName; }
    public String getSpec() { return spec; }
    public BigDecimal getQuantity() { return quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public BigDecimal getAmount() { return amount; }
    public String getRemark() { return remark; }
}
