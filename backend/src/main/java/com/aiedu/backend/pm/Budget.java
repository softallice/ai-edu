package com.aiedu.backend.pm;

import com.aiedu.backend.hr.Department;
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

/**
 * 예산대실적(Budget). 01.프로젝트관리 / 예산관리 화면의 기준 엔티티.
 * 유형({@link BudgetType})에 따라 부서({@link Department}) 또는 프로젝트({@link Project}) 중 하나를 연결.
 */
@Entity
@Table(name = "budgets")
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 예산 코드(업무 키). 서비스에서 채번. prefix: BG-yyyy-. */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    /** 예산 유형(팀/프로젝트). */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BudgetType budgetType;

    /** 부서. TEAM 유형일 때 사용. 선택. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    /** 프로젝트. PROJECT 유형일 때 사용. 선택. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    /** 회계연도(예: 2025). */
    @Column(nullable = false)
    private Integer fiscalYear;

    /** 예산항목(예: 인건비, 경비, 외주비). */
    @Column(nullable = false, length = 60)
    private String category;

    /** 계획금액. */
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal plannedAmount = BigDecimal.ZERO;

    /** 실적금액(기본값 0). */
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal actualAmount = BigDecimal.ZERO;

    /** 비고. */
    @Column(length = 300)
    private String note;

    protected Budget() {
    }

    private Budget(String code, BudgetType budgetType, Department department, Project project,
            Integer fiscalYear, String category, BigDecimal plannedAmount, BigDecimal actualAmount, String note) {
        this.code = code;
        this.budgetType = budgetType;
        this.department = department;
        this.project = project;
        this.fiscalYear = fiscalYear;
        this.category = category;
        this.plannedAmount = plannedAmount;
        this.actualAmount = actualAmount != null ? actualAmount : BigDecimal.ZERO;
        this.note = note;
    }

    /** 예산 레코드를 생성합니다. */
    public static Budget create(String code, BudgetType budgetType, Department department, Project project,
            Integer fiscalYear, String category, BigDecimal plannedAmount, BigDecimal actualAmount, String note) {
        return new Budget(code, budgetType, department, project, fiscalYear, category, plannedAmount, actualAmount, note);
    }

    /** 예산 레코드를 갱신합니다(코드는 불변). */
    public void update(BudgetType budgetType, Department department, Project project,
            Integer fiscalYear, String category, BigDecimal plannedAmount, BigDecimal actualAmount, String note) {
        this.budgetType = budgetType;
        this.department = department;
        this.project = project;
        this.fiscalYear = fiscalYear;
        this.category = category;
        this.plannedAmount = plannedAmount;
        this.actualAmount = actualAmount != null ? actualAmount : BigDecimal.ZERO;
        this.note = note;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public BudgetType getBudgetType() { return budgetType; }
    public Department getDepartment() { return department; }
    public Project getProject() { return project; }
    public Integer getFiscalYear() { return fiscalYear; }
    public String getCategory() { return category; }
    public BigDecimal getPlannedAmount() { return plannedAmount; }
    public BigDecimal getActualAmount() { return actualAmount; }
    public String getNote() { return note; }
}
