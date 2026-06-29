package com.aiedu.backend.sales;

import com.aiedu.backend.customer.Customer;
import com.aiedu.backend.hr.Employee;
import com.aiedu.backend.pm.Project;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * 계약(Contract) — 애그리거트 루트. koerp {@code Contract} 를 NDS 영업 계약에 맞게 단순화 이관.
 * 거래처({@link Customer})·프로젝트({@link Project})·영업담당({@link Employee})과 연결되며,
 * 계약 품목({@link ContractLine})을 자식으로 둡니다(cascade + orphanRemoval).
 * 세금계산서·수금 화면은 이 계약 위에서 파생됩니다.
 */
@Entity
@Table(name = "contracts")
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 계약번호(업무 키). 서비스에서 채번. */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    /** 연결 프로젝트. 선택. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    /** 영업 담당자. 선택. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private Employee owner;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ContractState state = ContractState.DRAFT;

    /** 체결일. */
    @Column(name = "contract_date")
    private LocalDate contractDate;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(nullable = false, length = 10)
    private String currency = "KRW";

    @Column(length = 1000)
    private String note;

    @Column(nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id asc")
    private List<ContractLine> lines = new ArrayList<>();

    protected Contract() {
    }

    private Contract(String code, String name, Customer customer, Project project, Employee owner, ContractState state,
            LocalDate contractDate, LocalDate startDate, LocalDate endDate, String currency, String note,
            boolean active) {
        this.code = code;
        this.name = name;
        this.customer = customer;
        this.project = project;
        this.owner = owner;
        this.state = state;
        this.contractDate = contractDate;
        this.startDate = startDate;
        this.endDate = endDate;
        this.currency = currency;
        this.note = note;
        this.active = active;
    }

    public static Contract create(String code, String name, Customer customer, Project project, Employee owner,
            ContractState state, LocalDate contractDate, LocalDate startDate, LocalDate endDate, String currency,
            String note, boolean active) {
        return new Contract(code, name, customer, project, owner, state, contractDate, startDate, endDate, currency,
                note, active);
    }

    /** 계약 기본정보를 갱신합니다(코드는 불변). */
    public void update(String name, Customer customer, Project project, Employee owner, ContractState state,
            LocalDate contractDate, LocalDate startDate, LocalDate endDate, String currency, String note,
            boolean active) {
        this.name = name;
        this.customer = customer;
        this.project = project;
        this.owner = owner;
        this.state = state;
        this.contractDate = contractDate;
        this.startDate = startDate;
        this.endDate = endDate;
        this.currency = currency;
        this.note = note;
        this.active = active;
    }

    public void addLine(ContractLine line) {
        lines.add(line);
        line.assignTo(this);
    }

    /** 기존 품목을 모두 비우고 새 목록으로 교체합니다(저장 시 동기화). */
    public void replaceLines(List<ContractLine> newLines) {
        lines.clear();
        for (ContractLine line : newLines) {
            addLine(line);
        }
    }

    /** 품목 금액 합계. */
    public BigDecimal totalAmount() {
        return lines.stream().map(ContractLine::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public Customer getCustomer() { return customer; }
    public Project getProject() { return project; }
    public Employee getOwner() { return owner; }
    public ContractState getState() { return state; }
    public LocalDate getContractDate() { return contractDate; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public String getCurrency() { return currency; }
    public String getNote() { return note; }
    public boolean isActive() { return active; }

    public List<ContractLine> getLines() { return List.copyOf(lines); }
}
