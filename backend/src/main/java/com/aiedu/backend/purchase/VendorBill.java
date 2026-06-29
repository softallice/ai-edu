package com.aiedu.backend.purchase;

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
 * 매입세금계산서(VendorBill). 03.구매 / 매입세금계산서 화면의 기준 엔티티.
 * 공급처({@link Customer}) 필수, 발주({@link PurchaseOrder}) 선택. 합계 = 공급가액 + 세액(저장 시 계산).
 */
@Entity
@Table(name = "vendor_bills")
public class VendorBill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 매입세금계산서 번호(업무 키). 서비스에서 채번. prefix "VB-"+년도 */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    /** 매입처(공급처). 필수. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Customer supplier;

    /** 연결 발주. 선택. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id")
    private PurchaseOrder purchaseOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "bill_type", nullable = false, length = 20)
    private VendorBillType billType;

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
    private VendorBillStatus status = VendorBillStatus.DRAFT;

    @Column(length = 500)
    private String note;

    protected VendorBill() {
    }

    private VendorBill(String code, Customer supplier, PurchaseOrder purchaseOrder, VendorBillType billType,
            LocalDate issueDate, BigDecimal supplyAmount, BigDecimal taxAmount, VendorBillStatus status,
            String note) {
        this.code = code;
        this.supplier = supplier;
        this.purchaseOrder = purchaseOrder;
        this.billType = billType;
        this.issueDate = issueDate;
        this.supplyAmount = supplyAmount;
        this.taxAmount = taxAmount;
        this.totalAmount = supplyAmount.add(taxAmount);
        this.status = status;
        this.note = note;
    }

    public static VendorBill create(String code, Customer supplier, PurchaseOrder purchaseOrder,
            VendorBillType billType, LocalDate issueDate, BigDecimal supplyAmount, BigDecimal taxAmount,
            VendorBillStatus status, String note) {
        return new VendorBill(code, supplier, purchaseOrder, billType, issueDate, supplyAmount, taxAmount,
                status, note);
    }

    /** 매입세금계산서를 갱신합니다(번호는 불변). 합계는 다시 계산합니다. */
    public void update(Customer supplier, PurchaseOrder purchaseOrder, VendorBillType billType,
            LocalDate issueDate, BigDecimal supplyAmount, BigDecimal taxAmount, VendorBillStatus status,
            String note) {
        this.supplier = supplier;
        this.purchaseOrder = purchaseOrder;
        this.billType = billType;
        this.issueDate = issueDate;
        this.supplyAmount = supplyAmount;
        this.taxAmount = taxAmount;
        this.totalAmount = supplyAmount.add(taxAmount);
        this.status = status;
        this.note = note;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public Customer getSupplier() { return supplier; }
    public PurchaseOrder getPurchaseOrder() { return purchaseOrder; }
    public VendorBillType getBillType() { return billType; }
    public LocalDate getIssueDate() { return issueDate; }
    public BigDecimal getSupplyAmount() { return supplyAmount; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public VendorBillStatus getStatus() { return status; }
    public String getNote() { return note; }
}
