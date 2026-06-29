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
 * 장부(Journal). 분개전표를 묶는 장부 마스터 엔티티.
 * 매출·매입·은행·현금·일반 유형을 {@link JournalType}으로 분류.
 */
@Entity
@Table(name = "journal")
public class Journal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 장부 코드(업무 키). 유일. */
    @Column(nullable = false, unique = true, length = 20)
    private String code;

    /** 장부 이름(필수). */
    @Column(nullable = false, length = 50)
    private String name;

    /** 장부 유형. */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private JournalType type;

    /** 전표 번호 접두어. */
    @Column(name = "sequence_prefix", length = 10)
    private String sequencePrefix;

    /** 채번 증가값. 기본값 10. */
    @Column(nullable = false)
    private int sequence = 10;

    /** 활성 여부. 기본값 true. */
    @Column(nullable = false)
    private boolean active = true;

    protected Journal() {
    }

    private Journal(String code, String name, JournalType type, String sequencePrefix) {
        this.code = code;
        this.name = name;
        this.type = type;
        this.sequencePrefix = sequencePrefix;
    }

    /** 장부를 생성합니다. */
    public static Journal create(String code, String name, JournalType type, String sequencePrefix) {
        return new Journal(code, name, type, sequencePrefix);
    }

    /** 장부를 갱신합니다(코드는 불변). */
    public void update(String name, JournalType type, String sequencePrefix, boolean active) {
        this.name = name;
        this.type = type;
        this.sequencePrefix = sequencePrefix;
        this.active = active;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public JournalType getType() { return type; }
    public String getSequencePrefix() { return sequencePrefix; }
    public int getSequence() { return sequence; }
    public boolean isActive() { return active; }
}
