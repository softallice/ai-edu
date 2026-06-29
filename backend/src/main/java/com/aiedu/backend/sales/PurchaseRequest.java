package com.aiedu.backend.sales;

import com.aiedu.backend.hr.Employee;
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
 * 구매의뢰(PurchaseRequest). 02.영업 / 구매의뢰 화면의 기준 엔티티.
 * 프로젝트({@link Project})·의뢰자({@link Employee})는 선택. 상태는 REQUESTED → APPROVED → ORDERED 흐름.
 */
@Entity
@Table(name = "purchase_requests")
public class PurchaseRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 구매의뢰 번호(업무 키). 서비스에서 채번. */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    /** 연결 프로젝트. 선택. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    /** 의뢰자 직원. 선택. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id")
    private Employee requester;

    @Column(name = "request_date")
    private LocalDate requestDate;

    @Column(name = "item_name", nullable = false, length = 200)
    private String itemName;

    private Integer quantity;

    @Column(name = "estimated_amount", precision = 18, scale = 2)
    private BigDecimal estimatedAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PurchaseRequestStatus status = PurchaseRequestStatus.REQUESTED;

    @Column(length = 500)
    private String note;

    protected PurchaseRequest() {
    }

    private PurchaseRequest(String code, Project project, Employee requester, LocalDate requestDate,
            String itemName, Integer quantity, BigDecimal estimatedAmount,
            PurchaseRequestStatus status, String note) {
        this.code = code;
        this.project = project;
        this.requester = requester;
        this.requestDate = requestDate;
        this.itemName = itemName;
        this.quantity = quantity;
        this.estimatedAmount = estimatedAmount != null ? estimatedAmount : BigDecimal.ZERO;
        this.status = status;
        this.note = note;
    }

    /** 구매의뢰를 생성합니다. */
    public static PurchaseRequest create(String code, Project project, Employee requester,
            LocalDate requestDate, String itemName, Integer quantity, BigDecimal estimatedAmount,
            PurchaseRequestStatus status, String note) {
        return new PurchaseRequest(code, project, requester, requestDate, itemName, quantity,
                estimatedAmount, status, note);
    }

    /** 구매의뢰를 갱신합니다(번호는 불변). */
    public void update(Project project, Employee requester, LocalDate requestDate, String itemName,
            Integer quantity, BigDecimal estimatedAmount, PurchaseRequestStatus status, String note) {
        this.project = project;
        this.requester = requester;
        this.requestDate = requestDate;
        this.itemName = itemName;
        this.quantity = quantity;
        this.estimatedAmount = estimatedAmount != null ? estimatedAmount : BigDecimal.ZERO;
        this.status = status;
        this.note = note;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public Project getProject() { return project; }
    public Employee getRequester() { return requester; }
    public LocalDate getRequestDate() { return requestDate; }
    public String getItemName() { return itemName; }
    public Integer getQuantity() { return quantity; }
    public BigDecimal getEstimatedAmount() { return estimatedAmount; }
    public PurchaseRequestStatus getStatus() { return status; }
    public String getNote() { return note; }
}
