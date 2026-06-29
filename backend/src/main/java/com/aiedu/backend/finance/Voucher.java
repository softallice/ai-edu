package com.aiedu.backend.finance;

import com.aiedu.backend.pm.Project;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
 * 회계전표(Voucher). 04.재무 / 전표 화면의 기준 엔티티.
 * 프로젝트({@link Project})는 선택 연결. 차변·대변 합계는 잔액 계산에 사용.
 */
@Entity
@Table(name = "vouchers")
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 전표 번호(업무 키). 서비스에서 채번 — prefix "JV-"+년도. */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    /** 전표 일자(필수). */
    @Column(name = "voucher_date", nullable = false)
    private LocalDate voucherDate;

    /** 계정과목(필수). */
    @Column(nullable = false, length = 60)
    private String account;

    /** 차변 금액. 기본값 0. */
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal debit = BigDecimal.ZERO;

    /** 대변 금액. 기본값 0. */
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal credit = BigDecimal.ZERO;

    /** 적요(설명). */
    @Column(length = 300)
    private String description;

    /** 연결 프로젝트. 선택. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    protected Voucher() {
    }

    private Voucher(String code, LocalDate voucherDate, String account,
            BigDecimal debit, BigDecimal credit, String description, Project project) {
        this.code = code;
        this.voucherDate = voucherDate;
        this.account = account;
        this.debit = debit;
        this.credit = credit;
        this.description = description;
        this.project = project;
    }

    /** 전표를 생성합니다. */
    public static Voucher create(String code, LocalDate voucherDate, String account,
            BigDecimal debit, BigDecimal credit, String description, Project project) {
        return new Voucher(code, voucherDate, account, debit, credit, description, project);
    }

    /** 전표를 갱신합니다(번호는 불변). */
    public void update(LocalDate voucherDate, String account,
            BigDecimal debit, BigDecimal credit, String description, Project project) {
        this.voucherDate = voucherDate;
        this.account = account;
        this.debit = debit;
        this.credit = credit;
        this.description = description;
        this.project = project;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public LocalDate getVoucherDate() { return voucherDate; }
    public String getAccount() { return account; }
    public BigDecimal getDebit() { return debit; }
    public BigDecimal getCredit() { return credit; }
    public String getDescription() { return description; }
    public Project getProject() { return project; }
}
