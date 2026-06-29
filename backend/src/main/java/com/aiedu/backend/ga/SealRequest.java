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
import java.time.LocalDate;

/**
 * 인감신청(SealRequest). 07.총무 / 인감관리 화면의 기준 엔티티.
 * 신청자({@link Employee}) 필수.
 */
@Entity
@Table(name = "seal_requests")
public class SealRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 신청 번호(업무 키). 서비스에서 채번. prefix = "SL-"+년도 */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    /** 신청자 직원. 필수. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    /** 인감 종류. */
    @Enumerated(EnumType.STRING)
    @Column(name = "seal_type", nullable = false, length = 30)
    private SealType sealType;

    /** 제목. 필수. */
    @Column(nullable = false, length = 200)
    private String title;

    /** 사용목적/반출처. */
    @Column(length = 500)
    private String purpose;

    /** 사용/반출 예정일. */
    @Column(name = "use_date")
    private LocalDate useDate;

    /** 처리 상태. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SealStatus status = SealStatus.REQUESTED;

    protected SealRequest() {
    }

    private SealRequest(String code, Employee employee, SealType sealType, String title,
            String purpose, LocalDate useDate, SealStatus status) {
        this.code = code;
        this.employee = employee;
        this.sealType = sealType;
        this.title = title;
        this.purpose = purpose;
        this.useDate = useDate;
        this.status = status;
    }

    /** 인감신청을 생성합니다. */
    public static SealRequest create(String code, Employee employee, SealType sealType,
            String title, String purpose, LocalDate useDate, SealStatus status) {
        return new SealRequest(code, employee, sealType, title, purpose, useDate, status);
    }

    /** 인감신청을 갱신합니다(번호는 불변). */
    public void update(Employee employee, SealType sealType, String title,
            String purpose, LocalDate useDate, SealStatus status) {
        this.employee = employee;
        this.sealType = sealType;
        this.title = title;
        this.purpose = purpose;
        this.useDate = useDate;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public Employee getEmployee() { return employee; }
    public SealType getSealType() { return sealType; }
    public String getTitle() { return title; }
    public String getPurpose() { return purpose; }
    public LocalDate getUseDate() { return useDate; }
    public SealStatus getStatus() { return status; }
}
