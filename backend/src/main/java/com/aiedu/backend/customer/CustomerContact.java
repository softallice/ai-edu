package com.aiedu.backend.customer;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * 거래처 담당자(CustomerContact) 엔티티.
 *
 * <p>레거시 ERP(ndserp)의 {@code NDSPMS.BE10C}(거래처 담당자) 테이블을 이관한 것입니다.
 * 레거시는 (CUST_CODE, DEPT_NM, EMP_NM) 복합키였으나, 모던화하면서 대리키(id)를 두고
 * {@link Customer} 애그리거트의 자식으로 둡니다.
 */
@Entity
@Table(name = "customer_contacts")
public class CustomerContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    /** 소속(레거시 DEPT_NM). */
    @Column(nullable = false, length = 100)
    private String department;

    /** 성명(레거시 EMP_NM). */
    @Column(nullable = false, length = 100)
    private String name;

    /** 전화번호(레거시 TEL_NO). */
    @Column(name = "tel_no", length = 30)
    private String telNo;

    /** 이메일(레거시 EMAIL). */
    @Column(length = 200)
    private String email;

    protected CustomerContact() {
        // JPA 전용
    }

    private CustomerContact(String department, String name, String telNo, String email) {
        this.department = department;
        this.name = name;
        this.telNo = telNo;
        this.email = email;
    }

    public static CustomerContact create(String department, String name, String telNo, String email) {
        return new CustomerContact(department, name, telNo, email);
    }

    /** 양방향 연관관계의 주인 쪽 설정. {@link Customer#addContact} 에서 호출합니다. */
    void assignTo(Customer customer) {
        this.customer = customer;
    }

    public Long getId() {
        return id;
    }

    public String getDepartment() {
        return department;
    }

    public String getName() {
        return name;
    }

    public String getTelNo() {
        return telNo;
    }

    public String getEmail() {
        return email;
    }
}
