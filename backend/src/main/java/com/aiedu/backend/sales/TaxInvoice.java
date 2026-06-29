package com.aiedu.backend.sales;

import com.aiedu.backend.customer.Customer;
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
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 매출세금계산서(TaxInvoice). 02.영업 / 세금계산서 화면의 기준 엔티티.
 * 거래처({@link Customer}) 필수, 계약({@link Contract}) 선택. 합계 = 공급가액 + 세액(저장 시 계산).
 */
@Entity
@Table(name = "tax_invoices")
public class TaxInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 세금계산서 번호(업무 키). 서비스에서 채번. */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    /** 연결 계약. 선택. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    private Contract contract;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "supply_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal supplyAmount = BigDecimal.ZERO;

    @Column(name = "tax_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaxInvoiceStatus status = TaxInvoiceStatus.DRAFT;

    @Column(length = 500)
    private String note;

    protected TaxInvoice() {
    }

    private TaxInvoice(String code, Customer customer, Contract contract, LocalDate issueDate,
            BigDecimal supplyAmount, BigDecimal taxAmount, TaxInvoiceStatus status, String note) {
        this.code = code;
        this.customer = customer;
        this.contract = contract;
        this.issueDate = issueDate;
        this.supplyAmount = supplyAmount;
        this.taxAmount = taxAmount;
        this.totalAmount = supplyAmount.add(taxAmount);
        this.status = status;
        this.note = note;
    }

    public static TaxInvoice create(String code, Customer customer, Contract contract, LocalDate issueDate,
            BigDecimal supplyAmount, BigDecimal taxAmount, TaxInvoiceStatus status, String note) {
        return new TaxInvoice(code, customer, contract, issueDate, supplyAmount, taxAmount, status, note);
    }

    /** 세금계산서를 갱신합니다(번호는 불변). 합계는 다시 계산합니다. */
    public void update(Customer customer, Contract contract, LocalDate issueDate, BigDecimal supplyAmount,
            BigDecimal taxAmount, TaxInvoiceStatus status, String note) {
        this.customer = customer;
        this.contract = contract;
        this.issueDate = issueDate;
        this.supplyAmount = supplyAmount;
        this.taxAmount = taxAmount;
        this.totalAmount = supplyAmount.add(taxAmount);
        this.status = status;
        this.note = note;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public Customer getCustomer() { return customer; }
    public Contract getContract() { return contract; }
    public LocalDate getIssueDate() { return issueDate; }
    public BigDecimal getSupplyAmount() { return supplyAmount; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public TaxInvoiceStatus getStatus() { return status; }
    public String getNote() { return note; }
}
