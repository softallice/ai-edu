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
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * 근태/출퇴근부(Attendance). 05.인사 / 근태관리 화면의 기준 엔티티.
 * 직원({@link Employee}) 필수 ManyToOne. 출근·퇴근 둘 다 있으면 workHours 자동 계산.
 */
@Entity
@Table(name = "attendances")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 근태 코드(업무 키). 서비스에서 채번. prefix "AT-"+년도. */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    /** 직원(필수). */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    /** 근무 날짜(필수). */
    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    /** 출근 시각(nullable). */
    @Column(name = "check_in")
    private LocalTime checkIn;

    /** 퇴근 시각(nullable). */
    @Column(name = "check_out")
    private LocalTime checkOut;

    /** 근무 시간(시간 단위, 소수 둘째 자리). 출근·퇴근 둘 다 있으면 자동 계산. */
    @Column(name = "work_hours", nullable = false, precision = 6, scale = 2)
    private BigDecimal workHours = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AttendanceStatus status = AttendanceStatus.NORMAL;

    /** 비고. */
    @Column(length = 300)
    private String note;

    protected Attendance() {
    }

    private Attendance(String code, Employee employee, LocalDate workDate, LocalTime checkIn,
            LocalTime checkOut, BigDecimal workHours, AttendanceStatus status, String note) {
        this.code = code;
        this.employee = employee;
        this.workDate = workDate;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.workHours = computeWorkHours(checkIn, checkOut, workHours);
        this.status = status;
        this.note = note;
    }

    public static Attendance create(String code, Employee employee, LocalDate workDate,
            LocalTime checkIn, LocalTime checkOut, BigDecimal workHours,
            AttendanceStatus status, String note) {
        return new Attendance(code, employee, workDate, checkIn, checkOut, workHours, status, note);
    }

    /** 근태 정보를 갱신합니다(코드는 불변). workHours는 출/퇴근 둘 다 있으면 자동 재계산합니다. */
    public void update(Employee employee, LocalDate workDate, LocalTime checkIn, LocalTime checkOut,
            BigDecimal workHours, AttendanceStatus status, String note) {
        this.employee = employee;
        this.workDate = workDate;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.workHours = computeWorkHours(checkIn, checkOut, workHours);
        this.status = status;
        this.note = note;
    }

    /**
     * 출근·퇴근이 둘 다 있으면 (퇴근 - 출근) 시간으로 계산.
     * 아니면 요청 값 또는 0을 사용.
     */
    private static BigDecimal computeWorkHours(LocalTime checkIn, LocalTime checkOut, BigDecimal requested) {
        if (checkIn != null && checkOut != null) {
            long seconds = java.time.Duration.between(checkIn, checkOut).getSeconds();
            return BigDecimal.valueOf(seconds).divide(BigDecimal.valueOf(3600), 2, RoundingMode.HALF_UP);
        }
        return requested != null ? requested : BigDecimal.ZERO;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public Employee getEmployee() { return employee; }
    public LocalDate getWorkDate() { return workDate; }
    public LocalTime getCheckIn() { return checkIn; }
    public LocalTime getCheckOut() { return checkOut; }
    public BigDecimal getWorkHours() { return workHours; }
    public AttendanceStatus getStatus() { return status; }
    public String getNote() { return note; }
}
