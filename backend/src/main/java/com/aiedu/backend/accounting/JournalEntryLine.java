package com.aiedu.backend.accounting;

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

/**
 * 분개전표 라인(JournalEntryLine). 분개전표({@link JournalEntry})의 차변·대변 명세 엔티티.
 * 외화 거래의 경우 {@code currencyCode}와 {@code amountCurrency}를 함께 기록.
 */
@Entity
@Table(name = "journal_entry_line")
public class JournalEntryLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 소속 분개전표(필수). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entry_id", nullable = false)
    private JournalEntry entry;

    /** 계정과목(필수). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    /** 라인 적요. */
    @Column(length = 200)
    private String name;

    /** 차변 금액. 기본값 0. */
    @Column(nullable = false, precision = 16, scale = 2)
    private BigDecimal debit = BigDecimal.ZERO;

    /** 대변 금액. 기본값 0. */
    @Column(nullable = false, precision = 16, scale = 2)
    private BigDecimal credit = BigDecimal.ZERO;

    /** 외화 통화 코드. 선택. */
    @Column(name = "currency_code", length = 10)
    private String currencyCode;

    /** 외화 금액. 선택. */
    @Column(name = "amount_currency", precision = 18, scale = 2)
    private BigDecimal amountCurrency;

    protected JournalEntryLine() {
    }

    private JournalEntryLine(JournalEntry entry, Account account, String name,
            BigDecimal debit, BigDecimal credit, String currencyCode, BigDecimal amountCurrency) {
        this.entry = entry;
        this.account = account;
        this.name = name;
        this.debit = debit;
        this.credit = credit;
        this.currencyCode = currencyCode;
        this.amountCurrency = amountCurrency;
    }

    /** 분개전표 라인을 생성합니다. */
    public static JournalEntryLine create(JournalEntry entry, Account account, String name,
            BigDecimal debit, BigDecimal credit, String currencyCode, BigDecimal amountCurrency) {
        return new JournalEntryLine(entry, account, name, debit, credit, currencyCode, amountCurrency);
    }

    public Long getId() { return id; }
    public JournalEntry getEntry() { return entry; }
    public Account getAccount() { return account; }
    public String getName() { return name; }
    public BigDecimal getDebit() { return debit; }
    public BigDecimal getCredit() { return credit; }
    public String getCurrencyCode() { return currencyCode; }
    public BigDecimal getAmountCurrency() { return amountCurrency; }
}
