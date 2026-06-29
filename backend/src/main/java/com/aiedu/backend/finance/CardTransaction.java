package com.aiedu.backend.finance;

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
import java.time.LocalDate;

/**
 * 법인카드 거래내역(CardTransaction). 04.재무 / 법인카드 화면의 기준 엔티티.
 * 승인→매입→청구→결제 흐름을 {@link CardTransactionStatus}로 추적.
 */
@Entity
@Table(name = "card_transactions")
public class CardTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 거래 코드(업무 키). 서비스에서 채번 — prefix "CC-"+년도. */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    /** 카드 번호(필수). 마스킹 형식 예: "1234-****-****-5678". */
    @Column(name = "card_no", nullable = false, length = 30)
    private String cardNo;

    /** 승인/사용 일자(필수). */
    @Column(name = "used_date", nullable = false)
    private LocalDate usedDate;

    /** 가맹점명. */
    @Column(length = 100)
    private String merchant;

    /** 승인 금액. 기본값 0. */
    @Column(name = "approval_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal approvalAmount = BigDecimal.ZERO;

    /** 매입 확정 금액. 기본값 0. */
    @Column(name = "purchase_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal purchaseAmount = BigDecimal.ZERO;

    /** 청구월. "YYYY-MM" 형식, nullable. */
    @Column(name = "billing_month", length = 7)
    private String billingMonth;

    /** 거래 상태(필수). */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CardTransactionStatus status;

    /** 카드 사용자(직원). 선택. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    /** 적요(설명). */
    @Column(length = 300)
    private String description;

    protected CardTransaction() {
    }

    private CardTransaction(String code, String cardNo, LocalDate usedDate, String merchant,
            BigDecimal approvalAmount, BigDecimal purchaseAmount, String billingMonth,
            CardTransactionStatus status, Employee employee, String description) {
        this.code = code;
        this.cardNo = cardNo;
        this.usedDate = usedDate;
        this.merchant = merchant;
        this.approvalAmount = approvalAmount;
        this.purchaseAmount = purchaseAmount;
        this.billingMonth = billingMonth;
        this.status = status;
        this.employee = employee;
        this.description = description;
    }

    /** 법인카드 거래내역을 생성합니다. */
    public static CardTransaction create(String code, String cardNo, LocalDate usedDate, String merchant,
            BigDecimal approvalAmount, BigDecimal purchaseAmount, String billingMonth,
            CardTransactionStatus status, Employee employee, String description) {
        return new CardTransaction(code, cardNo, usedDate, merchant,
                approvalAmount, purchaseAmount, billingMonth, status, employee, description);
    }

    /** 법인카드 거래내역을 갱신합니다(코드는 불변). */
    public void update(String cardNo, LocalDate usedDate, String merchant,
            BigDecimal approvalAmount, BigDecimal purchaseAmount, String billingMonth,
            CardTransactionStatus status, Employee employee, String description) {
        this.cardNo = cardNo;
        this.usedDate = usedDate;
        this.merchant = merchant;
        this.approvalAmount = approvalAmount;
        this.purchaseAmount = purchaseAmount;
        this.billingMonth = billingMonth;
        this.status = status;
        this.employee = employee;
        this.description = description;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getCardNo() { return cardNo; }
    public LocalDate getUsedDate() { return usedDate; }
    public String getMerchant() { return merchant; }
    public BigDecimal getApprovalAmount() { return approvalAmount; }
    public BigDecimal getPurchaseAmount() { return purchaseAmount; }
    public String getBillingMonth() { return billingMonth; }
    public CardTransactionStatus getStatus() { return status; }
    public Employee getEmployee() { return employee; }
    public String getDescription() { return description; }
}
