package com.aiedu.backend.commoncode;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * 공통코드(CommonCode). 08.공통 / 공통코드관리 화면의 기준 엔티티.
 * FK 의존 없는 독립 엔티티. (codeGroup, code) 조합이 유일.
 */
@Entity
@Table(name = "common_codes",
        uniqueConstraints = @UniqueConstraint(columnNames = {"code_group", "code"}))
public class CommonCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 코드 그룹(분류). 예: EXPENSE_TYPE. 업무 키, 생성 후 불변. */
    @Column(name = "code_group", nullable = false, length = 50)
    private String codeGroup;

    /** 코드 값. 예: MEAL. 그룹 내 유일, 생성 후 불변. */
    @Column(nullable = false, length = 50)
    private String code;

    /** 코드 명(표시 라벨). */
    @Column(nullable = false, length = 100)
    private String name;

    /** 정렬 순서(오름차순). */
    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    /** 사용 여부. */
    @Column(name = "use_yn", nullable = false)
    private boolean useYn = true;

    /** 설명(선택). */
    @Column(length = 300)
    private String description;

    protected CommonCode() {
    }

    private CommonCode(String codeGroup, String code, String name, int sortOrder,
            boolean useYn, String description) {
        this.codeGroup = codeGroup;
        this.code = code;
        this.name = name;
        this.sortOrder = sortOrder;
        this.useYn = useYn;
        this.description = description;
    }

    /** 공통코드를 생성합니다. */
    public static CommonCode create(String codeGroup, String code, String name, int sortOrder,
            boolean useYn, String description) {
        return new CommonCode(codeGroup, code, name, sortOrder, useYn, description);
    }

    /** 공통코드를 갱신합니다(그룹·코드 값은 불변). */
    public void update(String name, int sortOrder, boolean useYn, String description) {
        this.name = name;
        this.sortOrder = sortOrder;
        this.useYn = useYn;
        this.description = description;
    }

    public Long getId() { return id; }
    public String getCodeGroup() { return codeGroup; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public int getSortOrder() { return sortOrder; }
    public boolean isUseYn() { return useYn; }
    public String getDescription() { return description; }
}
