package com.aiedu.backend.accounting;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * 세금 그룹(TaxGroup). 여러 세금을 묶는 그룹 마스터 엔티티.
 */
@Entity
@Table(name = "tax_group")
public class TaxGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 그룹 이름(필수). */
    @Column(nullable = false, length = 100)
    private String name;

    /** 그룹 코드. 유일. */
    @Column(unique = true, length = 30)
    private String code;

    /** 정렬 순서. 기본값 10. */
    @Column(nullable = false)
    private int sequence = 10;

    /** 활성 여부. 기본값 true. */
    @Column(nullable = false)
    private boolean active = true;

    protected TaxGroup() {
    }

    private TaxGroup(String code, String name) {
        this.code = code;
        this.name = name;
    }

    /** 세금 그룹을 생성합니다. */
    public static TaxGroup create(String code, String name) {
        return new TaxGroup(code, name);
    }

    /** 세금 그룹을 갱신합니다(코드는 불변). */
    public void update(String name, boolean active) {
        this.name = name;
        this.active = active;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCode() { return code; }
    public int getSequence() { return sequence; }
    public boolean isActive() { return active; }
}
