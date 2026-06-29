package com.aiedu.backend.sales;

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
 * 프로젝트수금(ProjectCollection). 02.영업 / 수금 화면의 기준 엔티티.
 * 거래처({@link Customer}) 필수, 계약({@link Contract}) 및 프로젝트({@link Project}) 선택.
 */
@Entity
@Table(name = "project_collections")
public class ProjectCollection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 수금 번호(업무 키). 서비스에서 채번. */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    /** 연결 계약. 선택. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    private Contract contract;

    /** 연결 프로젝트. 선택. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "planned_date")
    private LocalDate plannedDate;

    /** 실제 수금일. 미수금 시 null. */
    @Column(name = "collect_date")
    private LocalDate collectDate;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CollectionMethod method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CollectionStatus status = CollectionStatus.PLANNED;

    @Column(length = 500)
    private String note;

    protected ProjectCollection() {
    }

    private ProjectCollection(String code, Customer customer, Contract contract, Project project,
            LocalDate plannedDate, LocalDate collectDate, BigDecimal amount,
            CollectionMethod method, CollectionStatus status, String note) {
        this.code = code;
        this.customer = customer;
        this.contract = contract;
        this.project = project;
        this.plannedDate = plannedDate;
        this.collectDate = collectDate;
        this.amount = amount;
        this.method = method;
        this.status = status;
        this.note = note;
    }

    /** 수금 레코드를 생성합니다. */
    public static ProjectCollection create(String code, Customer customer, Contract contract, Project project,
            LocalDate plannedDate, LocalDate collectDate, BigDecimal amount,
            CollectionMethod method, CollectionStatus status, String note) {
        return new ProjectCollection(code, customer, contract, project,
                plannedDate, collectDate, amount, method, status, note);
    }

    /** 수금 레코드를 갱신합니다(번호는 불변). */
    public void update(Customer customer, Contract contract, Project project,
            LocalDate plannedDate, LocalDate collectDate, BigDecimal amount,
            CollectionMethod method, CollectionStatus status, String note) {
        this.customer = customer;
        this.contract = contract;
        this.project = project;
        this.plannedDate = plannedDate;
        this.collectDate = collectDate;
        this.amount = amount;
        this.method = method;
        this.status = status;
        this.note = note;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public Customer getCustomer() { return customer; }
    public Contract getContract() { return contract; }
    public Project getProject() { return project; }
    public LocalDate getPlannedDate() { return plannedDate; }
    public LocalDate getCollectDate() { return collectDate; }
    public BigDecimal getAmount() { return amount; }
    public CollectionMethod getMethod() { return method; }
    public CollectionStatus getStatus() { return status; }
    public String getNote() { return note; }
}
