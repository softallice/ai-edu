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
 * 업적평가(Appraisal). 06.평가 / 본인평가·1차·2차 평가 엔티티.
 * 피평가자({@link Employee}) 필수, 대상 목표({@link EvalGoal}) 선택.
 */
@Entity
@Table(name = "appraisals")
public class Appraisal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 평가번호(업무 키). 서비스에서 채번. 형식: AP-{년도}-{순번4자리}. */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    /** 피평가자(직원). 필수. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    /** 평가 대상 목표. 선택. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "eval_goal_id")
    private EvalGoal evalGoal;

    /** 평가기간. 예: "2025-상반기". */
    @Column(nullable = false, length = 30)
    private String period;

    /** 본인평가점수. nullable. */
    @Column(name = "self_score", precision = 5, scale = 2)
    private BigDecimal selfScore;

    /** 1차평가점수. nullable. */
    @Column(name = "first_score", precision = 5, scale = 2)
    private BigDecimal firstScore;

    /** 2차평가점수. nullable. */
    @Column(name = "second_score", precision = 5, scale = 2)
    private BigDecimal secondScore;

    /** 등급. S/A/B/C/D. nullable. */
    @Column(length = 5)
    private String grade;

    /** 평가 진행 상태. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AppraisalStatus status = AppraisalStatus.SELF;

    /** 평가의견. nullable. */
    @Column(length = 500)
    private String comment;

    protected Appraisal() {
    }

    private Appraisal(String code, Employee employee, EvalGoal evalGoal,
            String period, BigDecimal selfScore, BigDecimal firstScore,
            BigDecimal secondScore, String grade, AppraisalStatus status, String comment) {
        this.code = code;
        this.employee = employee;
        this.evalGoal = evalGoal;
        this.period = period;
        this.selfScore = selfScore;
        this.firstScore = firstScore;
        this.secondScore = secondScore;
        this.grade = grade;
        this.status = status;
        this.comment = comment;
    }

    public static Appraisal create(String code, Employee employee, EvalGoal evalGoal,
            String period, BigDecimal selfScore, BigDecimal firstScore,
            BigDecimal secondScore, String grade, AppraisalStatus status, String comment) {
        return new Appraisal(code, employee, evalGoal, period,
                selfScore, firstScore, secondScore, grade, status, comment);
    }

    /** 업적평가를 갱신합니다(코드는 불변). */
    public void update(Employee employee, EvalGoal evalGoal, String period,
            BigDecimal selfScore, BigDecimal firstScore, BigDecimal secondScore,
            String grade, AppraisalStatus status, String comment) {
        this.employee = employee;
        this.evalGoal = evalGoal;
        this.period = period;
        this.selfScore = selfScore;
        this.firstScore = firstScore;
        this.secondScore = secondScore;
        this.grade = grade;
        this.status = status;
        this.comment = comment;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public Employee getEmployee() { return employee; }
    public EvalGoal getEvalGoal() { return evalGoal; }
    public String getPeriod() { return period; }
    public BigDecimal getSelfScore() { return selfScore; }
    public BigDecimal getFirstScore() { return firstScore; }
    public BigDecimal getSecondScore() { return secondScore; }
    public String getGrade() { return grade; }
    public AppraisalStatus getStatus() { return status; }
    public String getComment() { return comment; }
}
