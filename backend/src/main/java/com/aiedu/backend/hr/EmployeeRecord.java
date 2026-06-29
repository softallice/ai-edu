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
import java.time.LocalDate;

/**
 * 인적사항(EmployeeRecord). 05.인사 / 인적사항 화면의 기준 엔티티.
 * 직원({@link Employee}) 필수 ManyToOne. 학력/경력/업무이력을 recordType 으로 통합.
 */
@Entity
@Table(name = "employee_records")
public class EmployeeRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 인적사항 코드(업무 키). 서비스에서 채번. prefix "ER-"+년도. */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    /** 직원(필수). */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    /** 유형(필수). */
    @Enumerated(EnumType.STRING)
    @Column(name = "record_type", nullable = false, length = 20)
    private EmployeeRecordType recordType;

    /** 학교명/회사명/업무명(필수). */
    @Column(nullable = false, length = 200)
    private String title;

    /** 소속/기관. */
    @Column(length = 200)
    private String organization;

    /** 시작일. */
    @Column(name = "start_date")
    private LocalDate startDate;

    /** 종료일(재학/재직 중이면 null). */
    @Column(name = "end_date")
    private LocalDate endDate;

    /** 설명. */
    @Column(length = 500)
    private String description;

    /** 비고. */
    @Column(length = 300)
    private String note;

    protected EmployeeRecord() {
    }

    private EmployeeRecord(String code, Employee employee, EmployeeRecordType recordType,
            String title, String organization, LocalDate startDate, LocalDate endDate,
            String description, String note) {
        this.code = code;
        this.employee = employee;
        this.recordType = recordType;
        this.title = title;
        this.organization = organization;
        this.startDate = startDate;
        this.endDate = endDate;
        this.description = description;
        this.note = note;
    }

    public static EmployeeRecord create(String code, Employee employee, EmployeeRecordType recordType,
            String title, String organization, LocalDate startDate, LocalDate endDate,
            String description, String note) {
        return new EmployeeRecord(code, employee, recordType, title, organization,
                startDate, endDate, description, note);
    }

    /** 인적사항 정보를 갱신합니다(코드는 불변). */
    public void update(Employee employee, EmployeeRecordType recordType,
            String title, String organization, LocalDate startDate, LocalDate endDate,
            String description, String note) {
        this.employee = employee;
        this.recordType = recordType;
        this.title = title;
        this.organization = organization;
        this.startDate = startDate;
        this.endDate = endDate;
        this.description = description;
        this.note = note;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public Employee getEmployee() { return employee; }
    public EmployeeRecordType getRecordType() { return recordType; }
    public String getTitle() { return title; }
    public String getOrganization() { return organization; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public String getDescription() { return description; }
    public String getNote() { return note; }
}
