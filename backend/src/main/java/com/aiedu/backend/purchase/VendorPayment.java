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
 * 구매대금지급(VendorPayment). 03.구매 / 대금지급결재 화면의 기준 엔티티.
 * 지급대상 거래처({@link Customer}) 필수, 발주({@link PurchaseOrder}) 선택.
 */
@Entity
@Table(name = "vendor_payments")
public class VendorPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 지급번호(업무 키). 서비스에서 채번. prefix "VP-"+년도 */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    /** 지급대상 거래처. 필수. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Customer supplier;

    /** 연결 발주. 선택. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id")
    private PurchaseOrder purchaseOrder;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VendorPaymentStatus status = VendorPaymentStatus.REQUESTED;

    @Column(length = 500)
    private String note;

    protected VendorPayment() {
    }

    private VendorPayment(String code, Customer supplier, PurchaseOrder purchaseOrder, LocalDate paymentDate,
            BigDecimal amount, PaymentMethod method, VendorPaymentStatus status, String note) {
        this.code = code;
        this.supplier = supplier;
        this.purchaseOrder = purchaseOrder;
        this.paymentDate = paymentDate;
        this.amount = amount;
        this.method = method;
        this.status = status;
        this.note = note;
    }

    public static VendorPayment create(String code, Customer supplier, PurchaseOrder purchaseOrder,
            LocalDate paymentDate, BigDecimal amount, PaymentMethod method, VendorPaymentStatus status,
            String note) {
        return new VendorPayment(code, supplier, purchaseOrder, paymentDate, amount, method, status, note);
    }

    /** 대금지급 정보를 갱신합니다(번호는 불변). */
    public void update(Customer supplier, PurchaseOrder purchaseOrder, LocalDate paymentDate,
            BigDecimal amount, PaymentMethod method, VendorPaymentStatus status, String note) {
        this.supplier = supplier;
        this.purchaseOrder = purchaseOrder;
        this.paymentDate = paymentDate;
        this.amount = amount;
        this.method = method;
        this.status = status;
        this.note = note;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public Customer getSupplier() { return supplier; }
    public PurchaseOrder getPurchaseOrder() { return purchaseOrder; }
    public LocalDate getPaymentDate() { return paymentDate; }
    public BigDecimal getAmount() { return amount; }
    public PaymentMethod getMethod() { return method; }
    public VendorPaymentStatus getStatus() { return status; }
    public String getNote() { return note; }
}
