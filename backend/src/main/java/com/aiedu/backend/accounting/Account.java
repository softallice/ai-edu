package com.aiedu.backend.accounting;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * 계정과목(Account). 회계 시스템의 계정 과목 마스터 엔티티.
 * 자산·부채·자본·수익·비용 유형을 {@link AccountType}으로 분류.
 */
@Entity
@Table(name = "account")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 계정 코드(업무 키). 유일. */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    /** 계정 이름(필수). */
    @Column(nullable = false, length = 100)
    private String name;

    /** 계정 유형(필수). */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AccountType type;

    /** 활성 여부. 기본값 true. */
    @Column(nullable = false)
    private boolean active = true;

    protected Account() {
    }

    private Account(String code, String name, AccountType type) {
        this.code = code;
        this.name = name;
        this.type = type;
    }

    /** 계정과목을 생성합니다. */
    public static Account create(String code, String name, AccountType type) {
        return new Account(code, name, type);
    }

    /** 계정과목을 갱신합니다(코드는 불변). */
    public void update(String name, AccountType type, boolean active) {
        this.name = name;
        this.type = type;
        this.active = active;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public AccountType getType() { return type; }
    public boolean isActive() { return active; }
}
