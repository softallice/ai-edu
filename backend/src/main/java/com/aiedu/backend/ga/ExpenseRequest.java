package com.aiedu.backend.ga;

import com.aiedu.backend.hr.Employee;
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
 * 지출품의/비용신청(ExpenseRequest). 07.총무 / 지출품의 화면의 기준 엔티티.
 * 신청자({@link Employee}) 필수.
 */
@Entity
@Table(name = "expense_requests")
public class ExpenseRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 품의 번호(업무 키). 서비스에서 채번. prefix = "EX-"+년도 */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    /** 신청자 직원. 필수. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    /** 비용유형. */
    @Enumerated(EnumType.STRING)
    @Column(name = "expense_type", nullable = false, length = 20)
    private ExpenseType expenseType;

    /** 제목. 필수. */
    @Column(nullable = false, length = 200)
    private String title;

    /** 신청 금액. 필수. */
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    /** 신청일. */
    @Column(name = "request_date")
    private LocalDate requestDate;

    /** 사유. */
    @Column(length = 500)
    private String reason;

    /** 처리 상태. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ExpenseStatus status = ExpenseStatus.REQUESTED;

    protected ExpenseRequest() {
    }

    private ExpenseRequest(String code, Employee employee, ExpenseType expenseType, String title,
            BigDecimal amount, LocalDate requestDate, String reason, ExpenseStatus status) {
        this.code = code;
        this.employee = employee;
        this.expenseType = expenseType;
        this.title = title;
        this.amount = amount;
        this.requestDate = requestDate;
        this.reason = reason;
        this.status = status;
    }

    /** 지출품의를 생성합니다. */
    public static ExpenseRequest create(String code, Employee employee, ExpenseType expenseType,
            String title, BigDecimal amount, LocalDate requestDate, String reason, ExpenseStatus status) {
        return new ExpenseRequest(code, employee, expenseType, title, amount, requestDate, reason, status);
    }

    /** 지출품의를 갱신합니다(번호는 불변). */
    public void update(Employee employee, ExpenseType expenseType, String title, BigDecimal amount,
            LocalDate requestDate, String reason, ExpenseStatus status) {
        this.employee = employee;
        this.expenseType = expenseType;
        this.title = title;
        this.amount = amount;
        this.requestDate = requestDate;
        this.reason = reason;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public Employee getEmployee() { return employee; }
    public ExpenseType getExpenseType() { return expenseType; }
    public String getTitle() { return title; }
    public BigDecimal getAmount() { return amount; }
    public LocalDate getRequestDate() { return requestDate; }
    public String getReason() { return reason; }
    public ExpenseStatus getStatus() { return status; }
}
