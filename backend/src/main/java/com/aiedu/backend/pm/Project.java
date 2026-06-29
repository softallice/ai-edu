package com.aiedu.backend.pm;

import com.aiedu.backend.customer.Customer;
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
 * 프로젝트(Project). koerp {@code project} 모델 이관.
 * 고객({@link Customer})·PM({@link Employee})·진행단계({@link ProjectStatus}) 연결을 가진 마스터.
 * 활동시간({@link Timesheet})·가동율·예산실적 등 01.프로젝트관리 모듈 화면의 기준 엔티티.
 */
@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 프로젝트 코드(업무 키). 서비스에서 채번. */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    /** 고객(거래처). 선택. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    /** PM(주관 담당자). 선택. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Employee manager;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProjectStatus status = ProjectStatus.PLANNED;

    @Column(name = "date_start")
    private LocalDate dateStart;

    @Column(name = "date_end")
    private LocalDate dateEnd;

    @Column(nullable = false)
    private boolean active = true;

    protected Project() {
    }

    private Project(String code, String name, Customer customer, Employee manager, ProjectStatus status,
            LocalDate dateStart, LocalDate dateEnd, boolean active) {
        this.code = code;
        this.name = name;
        this.customer = customer;
        this.manager = manager;
        this.status = status;
        this.dateStart = dateStart;
        this.dateEnd = dateEnd;
        this.active = active;
    }

    public static Project create(String code, String name, Customer customer, Employee manager, ProjectStatus status,
            LocalDate dateStart, LocalDate dateEnd, boolean active) {
        return new Project(code, name, customer, manager, status, dateStart, dateEnd, active);
    }

    /** 프로젝트 기본정보를 갱신합니다(코드는 불변). */
    public void update(String name, Customer customer, Employee manager, ProjectStatus status,
            LocalDate dateStart, LocalDate dateEnd, boolean active) {
        this.name = name;
        this.customer = customer;
        this.manager = manager;
        this.status = status;
        this.dateStart = dateStart;
        this.dateEnd = dateEnd;
        this.active = active;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public Customer getCustomer() { return customer; }
    public Employee getManager() { return manager; }
    public ProjectStatus getStatus() { return status; }
    public LocalDate getDateStart() { return dateStart; }
    public LocalDate getDateEnd() { return dateEnd; }
    public boolean isActive() { return active; }
}
