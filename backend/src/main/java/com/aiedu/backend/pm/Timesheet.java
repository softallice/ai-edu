package com.aiedu.backend.pm;

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
import java.time.LocalDateTime;

/**
 * 활동시간(Timesheet). koerp {@code timesheet} 모델 이관.
 * 직원이 프로젝트에 투입한 공수(시간)를 일자 단위로 기록합니다 — 01.프로젝트관리 모듈
 * "활동시간등록/조회/승인"의 데이터원이며, 가동율·예산대실적·실적 화면이 이 위에서 파생됩니다.
 */
@Entity
@Table(name = "timesheets")
public class Timesheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal hours;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false, length = 20)
    private ActivityType activityType = ActivityType.DEVELOPMENT;

    @Column(length = 500)
    private String description;

    /** 청구 가능 공수 여부(koerp billable). */
    @Column(nullable = false)
    private boolean billable = false;

    /** 승인(검증) 완료 여부(koerp timesheet validation). 승인 화면 슬라이스에서 사용. */
    @Column(nullable = false)
    private boolean validated = false;

    @Column(name = "validated_at")
    private LocalDateTime validatedAt;

    protected Timesheet() {
    }

    private Timesheet(Employee employee, Project project, LocalDate workDate, BigDecimal hours,
            ActivityType activityType, String description, boolean billable) {
        this.employee = employee;
        this.project = project;
        this.workDate = workDate;
        this.hours = hours;
        this.activityType = activityType;
        this.description = description;
        this.billable = billable;
    }

    public static Timesheet create(Employee employee, Project project, LocalDate workDate, BigDecimal hours,
            ActivityType activityType, String description, boolean billable) {
        return new Timesheet(employee, project, workDate, hours, activityType, description, billable);
    }

    /** 등록 내용을 수정합니다. 이미 승인된 건은 서비스에서 차단합니다. */
    public void update(Employee employee, Project project, LocalDate workDate, BigDecimal hours,
            ActivityType activityType, String description, boolean billable) {
        this.employee = employee;
        this.project = project;
        this.workDate = workDate;
        this.hours = hours;
        this.activityType = activityType;
        this.description = description;
        this.billable = billable;
    }

    public Long getId() { return id; }
    public Employee getEmployee() { return employee; }
    public Project getProject() { return project; }
    public LocalDate getWorkDate() { return workDate; }
    public BigDecimal getHours() { return hours; }
    public ActivityType getActivityType() { return activityType; }
    public String getDescription() { return description; }
    public boolean isBillable() { return billable; }
    public boolean isValidated() { return validated; }
    public LocalDateTime getValidatedAt() { return validatedAt; }
}
