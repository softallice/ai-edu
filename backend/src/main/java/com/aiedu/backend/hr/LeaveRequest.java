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
import java.time.LocalDate;

/**
 * 휴가/근로신청(LeaveRequest). 05.인사 / 근태관리 화면의 기준 엔티티.
 * 직원({@link Employee}) 필수 ManyToOne. 휴가(연차/반차/병가/경조)와 연장/휴일근로를 type으로 통합.
 */
@Entity
@Table(name = "leave_requests")
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 신청 코드(업무 키). 서비스에서 채번. prefix "LR-"+년도. */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    /** 직원(필수). */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    /** 신청 유형(필수). */
    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", nullable = false, length = 20)
    private LeaveRequestType requestType;

    /** 시작일(필수). */
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    /** 종료일(필수). */
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    /** 휴가 일수(연차류에서 사용; 반차=0.5). */
    @Column(precision = 5, scale = 1)
    private BigDecimal days;

    /** 근로 시간(연장/휴일근로에서 사용). */
    @Column(precision = 5, scale = 1)
    private BigDecimal hours;

    /** 신청 사유. */
    @Column(length = 300)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LeaveRequestStatus status = LeaveRequestStatus.REQUESTED;

    /** 비고. */
    @Column(length = 300)
    private String note;

    protected LeaveRequest() {
    }

    private LeaveRequest(String code, Employee employee, LeaveRequestType requestType,
            LocalDate startDate, LocalDate endDate, BigDecimal days, BigDecimal hours,
            String reason, LeaveRequestStatus status, String note) {
        this.code = code;
        this.employee = employee;
        this.requestType = requestType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.days = days;
        this.hours = hours;
        this.reason = reason;
        this.status = status;
        this.note = note;
    }

    public static LeaveRequest create(String code, Employee employee, LeaveRequestType requestType,
            LocalDate startDate, LocalDate endDate, BigDecimal days, BigDecimal hours,
            String reason, LeaveRequestStatus status, String note) {
        return new LeaveRequest(code, employee, requestType, startDate, endDate, days, hours, reason, status, note);
    }

    /** 신청 정보를 갱신합니다(코드는 불변). */
    public void update(Employee employee, LeaveRequestType requestType,
            LocalDate startDate, LocalDate endDate, BigDecimal days, BigDecimal hours,
            String reason, LeaveRequestStatus status, String note) {
        this.employee = employee;
        this.requestType = requestType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.days = days;
        this.hours = hours;
        this.reason = reason;
        this.status = status;
        this.note = note;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public Employee getEmployee() { return employee; }
    public LeaveRequestType getRequestType() { return requestType; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public BigDecimal getDays() { return days; }
    public BigDecimal getHours() { return hours; }
    public String getReason() { return reason; }
    public LeaveRequestStatus getStatus() { return status; }
    public String getNote() { return note; }
}
