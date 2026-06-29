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
 * 제안내역(Proposal). 02.영업 / 제안내역 화면의 기준 엔티티.
 * 거래처({@link Customer}) 필수, 프로젝트({@link Project}) 선택.
 */
@Entity
@Table(name = "proposals")
public class Proposal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 제안번호(업무 키). 서비스에서 채번. prefix "PP-"+연도. */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    /** 연결 프로젝트. 선택. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "proposal_date")
    private LocalDate proposalDate;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(precision = 18, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProposalStatus status = ProposalStatus.DRAFT;

    @Column(length = 500)
    private String note;

    protected Proposal() {
    }

    private Proposal(String code, Customer customer, Project project, LocalDate proposalDate,
            String title, BigDecimal amount, ProposalStatus status, String note) {
        this.code = code;
        this.customer = customer;
        this.project = project;
        this.proposalDate = proposalDate;
        this.title = title;
        this.amount = amount != null ? amount : BigDecimal.ZERO;
        this.status = status;
        this.note = note;
    }

    public static Proposal create(String code, Customer customer, Project project, LocalDate proposalDate,
            String title, BigDecimal amount, ProposalStatus status, String note) {
        return new Proposal(code, customer, project, proposalDate, title, amount, status, note);
    }

    /** 제안내역을 갱신합니다(번호는 불변). */
    public void update(Customer customer, Project project, LocalDate proposalDate,
            String title, BigDecimal amount, ProposalStatus status, String note) {
        this.customer = customer;
        this.project = project;
        this.proposalDate = proposalDate;
        this.title = title;
        this.amount = amount != null ? amount : BigDecimal.ZERO;
        this.status = status;
        this.note = note;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public Customer getCustomer() { return customer; }
    public Project getProject() { return project; }
    public LocalDate getProposalDate() { return proposalDate; }
    public String getTitle() { return title; }
    public BigDecimal getAmount() { return amount; }
    public ProposalStatus getStatus() { return status; }
    public String getNote() { return note; }
}
