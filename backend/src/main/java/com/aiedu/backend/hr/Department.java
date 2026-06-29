package com.aiedu.backend.hr;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * 부서(Department). koerp {@code department} 모델 이관.
 * 조직도 계층은 {@code parentId}(자기참조 키)로 표현합니다.
 */
@Entity
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private int sequence = 10;

    @Column(nullable = false)
    private boolean active = true;

    /** 상위 부서 id(없으면 최상위). */
    @Column(name = "parent_id")
    private Long parentId;

    protected Department() {
    }

    private Department(String code, String name, int sequence, boolean active, Long parentId) {
        this.code = code;
        this.name = name;
        this.sequence = sequence;
        this.active = active;
        this.parentId = parentId;
    }

    public static Department create(String code, String name, int sequence, boolean active, Long parentId) {
        return new Department(code, name, sequence, active, parentId);
    }

    public void update(String code, String name, int sequence, boolean active, Long parentId) {
        this.code = code;
        this.name = name;
        this.sequence = sequence;
        this.active = active;
        this.parentId = parentId;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public int getSequence() { return sequence; }
    public boolean isActive() { return active; }
    public Long getParentId() { return parentId; }
}
