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
 * 교육신청(EducationRequest). 05.인사 / 교육관리 화면의 기준 엔티티.
 * 직원({@link Employee}) 필수 ManyToOne. 외부교육(EXTERNAL)과 자격증(CERT)을 type으로 통합.
 */
@Entity
@Table(name = "education_requests")
public class EducationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 신청 코드(업무 키). 서비스에서 채번. prefix "ED-"+년도. */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    /** 직원(필수). */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    /** 교육 유형(필수). */
    @Enumerated(EnumType.STRING)
    @Column(name = "edu_type", nullable = false, length = 20)
    private EducationType eduType;

    /** 교육명(필수). */
    @Column(nullable = false, length = 200)
    private String title;

    /** 교육 기관. */
    @Column(length = 200)
    private String institution;

    /** 교육 시작일. */
    @Column(name = "start_date")
    private LocalDate startDate;

    /** 교육 종료일. */
    @Column(name = "end_date")
    private LocalDate endDate;

    /** 교육 비용. */
    @Column(precision = 18, scale = 2)
    private BigDecimal cost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EducationStatus status;

    /** 교육 결과. */
    @Column(length = 200)
    private String result;

    /** 비고. */
    @Column(length = 300)
    private String note;

    protected EducationRequest() {
    }

    private EducationRequest(String code, Employee employee, EducationType eduType,
            String title, String institution, LocalDate startDate, LocalDate endDate,
            BigDecimal cost, EducationStatus status, String result, String note) {
        this.code = code;
        this.employee = employee;
        this.eduType = eduType;
        this.title = title;
        this.institution = institution;
        this.startDate = startDate;
        this.endDate = endDate;
        this.cost = cost;
        this.status = status;
        this.result = result;
        this.note = note;
    }

    public static EducationRequest create(String code, Employee employee, EducationType eduType,
            String title, String institution, LocalDate startDate, LocalDate endDate,
            BigDecimal cost, EducationStatus status, String result, String note) {
        return new EducationRequest(code, employee, eduType, title, institution,
                startDate, endDate, cost, status, result, note);
    }

    /** 교육신청 정보를 갱신합니다(코드는 불변). */
    public void update(Employee employee, EducationType eduType,
            String title, String institution, LocalDate startDate, LocalDate endDate,
            BigDecimal cost, EducationStatus status, String result, String note) {
        this.employee = employee;
        this.eduType = eduType;
        this.title = title;
        this.institution = institution;
        this.startDate = startDate;
        this.endDate = endDate;
        this.cost = cost;
        this.status = status;
        this.result = result;
        this.note = note;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public Employee getEmployee() { return employee; }
    public EducationType getEduType() { return eduType; }
    public String getTitle() { return title; }
    public String getInstitution() { return institution; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public BigDecimal getCost() { return cost; }
    public EducationStatus getStatus() { return status; }
    public String getResult() { return result; }
    public String getNote() { return note; }
}
