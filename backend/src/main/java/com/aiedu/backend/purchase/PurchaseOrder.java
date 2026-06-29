package com.aiedu.backend.purchase;

import com.aiedu.backend.customer.Customer;
import com.aiedu.backend.pm.Project;
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
 * 구매발주(PurchaseOrder). 03.구매 / 발주 화면의 기준 엔티티.
 * 공급처({@link Customer}) 필수, 프로젝트({@link Project}) 선택.
 */
@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 발주번호(업무 키). 서비스에서 채번. prefix "PO-"+년도 */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    /** 공급처(거래처). 필수. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Customer supplier;

    /** 연결 프로젝트. 선택. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "order_date")
    private LocalDate orderDate;

    /** 납기일. 선택. */
    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PurchaseOrderStatus status = PurchaseOrderStatus.DRAFT;

    @Column(length = 500)
    private String note;

    protected PurchaseOrder() {
    }

    private PurchaseOrder(String code, Customer supplier, Project project, LocalDate orderDate,
            LocalDate deliveryDate, BigDecimal amount, PurchaseOrderStatus status, String note) {
        this.code = code;
        this.supplier = supplier;
        this.project = project;
        this.orderDate = orderDate;
        this.deliveryDate = deliveryDate;
        this.amount = amount;
        this.status = status;
        this.note = note;
    }

    public static PurchaseOrder create(String code, Customer supplier, Project project, LocalDate orderDate,
            LocalDate deliveryDate, BigDecimal amount, PurchaseOrderStatus status, String note) {
        return new PurchaseOrder(code, supplier, project, orderDate, deliveryDate, amount, status, note);
    }

    /** 발주를 갱신합니다(번호는 불변). */
    public void update(Customer supplier, Project project, LocalDate orderDate, LocalDate deliveryDate,
            BigDecimal amount, PurchaseOrderStatus status, String note) {
        this.supplier = supplier;
        this.project = project;
        this.orderDate = orderDate;
        this.deliveryDate = deliveryDate;
        this.amount = amount;
        this.status = status;
        this.note = note;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public Customer getSupplier() { return supplier; }
    public Project getProject() { return project; }
    public LocalDate getOrderDate() { return orderDate; }
    public LocalDate getDeliveryDate() { return deliveryDate; }
    public BigDecimal getAmount() { return amount; }
    public PurchaseOrderStatus getStatus() { return status; }
    public String getNote() { return note; }
}
