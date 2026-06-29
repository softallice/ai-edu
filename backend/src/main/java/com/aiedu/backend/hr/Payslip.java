package com.aiedu.backend.hr;

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
 * 급여명세(Payslip). 05.인사 / 급여조회 화면의 기준 엔티티.
 * 직원({@link Employee}) 필수 ManyToOne. 실지급액 = 기본급 + 수당 + 상여 - 공제.
 */
@Entity
@Table(name = "payslips")
public class Payslip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 급여명세 코드(업무 키). 서비스에서 채번. prefix "PS-"+년도. */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    /** 직원(필수). */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    /** 귀속월 (YYYY-MM, 필수). */
    @Column(name = "pay_month", nullable = false, length = 7)
    private String payMonth;

    /** 기본급. */
    @Column(name = "base_salary", nullable = false, precision = 18, scale = 2)
    private BigDecimal baseSalary = BigDecimal.ZERO;

    /** 수당. */
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal allowance = BigDecimal.ZERO;

    /** 상여/성과금. */
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal bonus = BigDecimal.ZERO;

    /** 공제계(4대보험·세금). */
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal deduction = BigDecimal.ZERO;

    /** 실지급액 = 기본급 + 수당 + 상여 - 공제. 저장 시 계산. */
    @Column(name = "net_pay", nullable = false, precision = 18, scale = 2)
    private BigDecimal netPay = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PayslipStatus status = PayslipStatus.DRAFT;

    /** 비고. */
    @Column(length = 300)
    private String note;

    protected Payslip() {
    }

    private Payslip(String code, Employee employee, String payMonth,
            BigDecimal baseSalary, BigDecimal allowance, BigDecimal bonus,
            BigDecimal deduction, PayslipStatus status, String note) {
        this.code = code;
        this.employee = employee;
        this.payMonth = payMonth;
        this.baseSalary = baseSalary;
        this.allowance = allowance;
        this.bonus = bonus;
        this.deduction = deduction;
        this.netPay = calcNetPay(baseSalary, allowance, bonus, deduction);
        this.status = status;
        this.note = note;
    }

    public static Payslip create(String code, Employee employee, String payMonth,
            BigDecimal baseSalary, BigDecimal allowance, BigDecimal bonus,
            BigDecimal deduction, PayslipStatus status, String note) {
        return new Payslip(code, employee, payMonth, baseSalary, allowance, bonus, deduction, status, note);
    }

    /** 급여명세를 갱신합니다(코드는 불변). 실지급액을 재계산합니다. */
    public void update(Employee employee, String payMonth,
            BigDecimal baseSalary, BigDecimal allowance, BigDecimal bonus,
            BigDecimal deduction, PayslipStatus status, String note) {
        this.employee = employee;
        this.payMonth = payMonth;
        this.baseSalary = baseSalary;
        this.allowance = allowance;
        this.bonus = bonus;
        this.deduction = deduction;
        this.netPay = calcNetPay(baseSalary, allowance, bonus, deduction);
        this.status = status;
        this.note = note;
    }

    private static BigDecimal calcNetPay(BigDecimal baseSalary, BigDecimal allowance,
            BigDecimal bonus, BigDecimal deduction) {
        return baseSalary.add(allowance).add(bonus).subtract(deduction);
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public Employee getEmployee() { return employee; }
    public String getPayMonth() { return payMonth; }
    public BigDecimal getBaseSalary() { return baseSalary; }
    public BigDecimal getAllowance() { return allowance; }
    public BigDecimal getBonus() { return bonus; }
    public BigDecimal getDeduction() { return deduction; }
    public BigDecimal getNetPay() { return netPay; }
    public PayslipStatus getStatus() { return status; }
    public String getNote() { return note; }
}
