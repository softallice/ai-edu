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
 * 직원(Employee). koerp {@code employee} 모델 이관.
 * (v1: 보고라인 manager 자기참조는 단순화를 위해 제외)
 */
@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_no", nullable = false, unique = true, length = 30)
    private String employeeNo;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Position position = Position.STAFF;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", nullable = false, length = 20)
    private EmploymentType employmentType = EmploymentType.REGULAR;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @Column(name = "departure_date")
    private LocalDate departureDate;

    @Column(name = "cost_rate", precision = 16, scale = 2)
    private BigDecimal costRate = BigDecimal.ZERO;

    @Column(name = "work_email", length = 200)
    private String workEmail;

    @Column(name = "work_phone", length = 30)
    private String workPhone;

    @Column(length = 30)
    private String mobile;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;

    private LocalDate birthday;

    protected Employee() {
    }

    private Employee(String employeeNo, String name, boolean active, Department department, Position position,
            EmploymentType employmentType, LocalDate hireDate, LocalDate departureDate, BigDecimal costRate,
            String workEmail, String workPhone, String mobile, Gender gender, LocalDate birthday) {
        this.employeeNo = employeeNo;
        this.name = name;
        this.active = active;
        this.department = department;
        this.position = position;
        this.employmentType = employmentType;
        this.hireDate = hireDate;
        this.departureDate = departureDate;
        this.costRate = costRate;
        this.workEmail = workEmail;
        this.workPhone = workPhone;
        this.mobile = mobile;
        this.gender = gender;
        this.birthday = birthday;
    }

    public static Employee create(String employeeNo, String name, boolean active, Department department,
            Position position, EmploymentType employmentType, LocalDate hireDate, LocalDate departureDate,
            BigDecimal costRate, String workEmail, String workPhone, String mobile, Gender gender, LocalDate birthday) {
        return new Employee(employeeNo, name, active, department, position, employmentType, hireDate, departureDate,
                costRate, workEmail, workPhone, mobile, gender, birthday);
    }

    public void update(String employeeNo, String name, boolean active, Department department, Position position,
            EmploymentType employmentType, LocalDate hireDate, LocalDate departureDate, BigDecimal costRate,
            String workEmail, String workPhone, String mobile, Gender gender, LocalDate birthday) {
        this.employeeNo = employeeNo;
        this.name = name;
        this.active = active;
        this.department = department;
        this.position = position;
        this.employmentType = employmentType;
        this.hireDate = hireDate;
        this.departureDate = departureDate;
        this.costRate = costRate;
        this.workEmail = workEmail;
        this.workPhone = workPhone;
        this.mobile = mobile;
        this.gender = gender;
        this.birthday = birthday;
    }

    public Long getId() { return id; }
    public String getEmployeeNo() { return employeeNo; }
    public String getName() { return name; }
    public boolean isActive() { return active; }
    public Department getDepartment() { return department; }
    public Position getPosition() { return position; }
    public EmploymentType getEmploymentType() { return employmentType; }
    public LocalDate getHireDate() { return hireDate; }
    public LocalDate getDepartureDate() { return departureDate; }
    public BigDecimal getCostRate() { return costRate; }
    public String getWorkEmail() { return workEmail; }
    public String getWorkPhone() { return workPhone; }
    public String getMobile() { return mobile; }
    public Gender getGender() { return gender; }
    public LocalDate getBirthday() { return birthday; }
}
