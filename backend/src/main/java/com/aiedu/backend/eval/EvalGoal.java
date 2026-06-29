package com.aiedu.backend.eval;

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
import java.math.BigDecimal;

/**
 * 업적목표(EvalGoal). 06.평가 / 업적목표등록 화면의 기준 엔티티.
 * 직원({@link Employee}) 필수. 가중치 합계 100% 제약은 서비스 레이어에서 관리.
 */
@Entity
@Table(name = "eval_goals")
public class EvalGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 업적목표 번호(업무 키). 서비스에서 채번. 형식: EG-{년도}-{순번4자리}. */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    /** 대상 직원. 필수. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    /** 평가기간. 예: "2025-상반기". */
    @Column(nullable = false, length = 30)
    private String period;

    /** 업적목표명. */
    @Column(nullable = false, length = 200)
    private String title;

    /** 가중치(%). 0~100 범위. */
    @Column
    private Integer weight;

    /** 목표수준. */
    @Column(name = "target_value", length = 200)
    private String targetValue;

    /** 본인평가점수. nullable. */
    @Column(name = "self_score", precision = 5, scale = 2)
    private BigDecimal selfScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EvalGoalStatus status = EvalGoalStatus.DRAFT;

    @Column(length = 500)
    private String note;

    protected EvalGoal() {
    }

    private EvalGoal(String code, Employee employee, String period, String title,
            Integer weight, String targetValue, BigDecimal selfScore,
            EvalGoalStatus status, String note) {
        this.code = code;
        this.employee = employee;
        this.period = period;
        this.title = title;
        this.weight = weight;
        this.targetValue = targetValue;
        this.selfScore = selfScore;
        this.status = status;
        this.note = note;
    }

    public static EvalGoal create(String code, Employee employee, String period, String title,
            Integer weight, String targetValue, BigDecimal selfScore,
            EvalGoalStatus status, String note) {
        return new EvalGoal(code, employee, period, title, weight, targetValue, selfScore, status, note);
    }

    /** 업적목표를 갱신합니다(코드는 불변). */
    public void update(Employee employee, String period, String title,
            Integer weight, String targetValue, BigDecimal selfScore,
            EvalGoalStatus status, String note) {
        this.employee = employee;
        this.period = period;
        this.title = title;
        this.weight = weight;
        this.targetValue = targetValue;
        this.selfScore = selfScore;
        this.status = status;
        this.note = note;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public Employee getEmployee() { return employee; }
    public String getPeriod() { return period; }
    public String getTitle() { return title; }
    public Integer getWeight() { return weight; }
    public String getTargetValue() { return targetValue; }
    public BigDecimal getSelfScore() { return selfScore; }
    public EvalGoalStatus getStatus() { return status; }
    public String getNote() { return note; }
}
