package com.aiedu.backend.finance.dto;

import com.aiedu.backend.finance.CardTransaction;
import com.aiedu.backend.finance.CardTransactionStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 법인카드 거래내역 응답(직원명 평탄화 포함). */
public record CardTransactionResponse(
        Long id,
        String code,
        String cardNo,
        LocalDate usedDate,
        String merchant,
        BigDecimal approvalAmount,
        BigDecimal purchaseAmount,
        String billingMonth,
        CardTransactionStatus status,
        Long employeeId,
        String employeeName,
        String description) {

    public static CardTransactionResponse from(CardTransaction c) {
        return new CardTransactionResponse(
                c.getId(),
                c.getCode(),
                c.getCardNo(),
                c.getUsedDate(),
                c.getMerchant(),
                c.getApprovalAmount(),
                c.getPurchaseAmount(),
                c.getBillingMonth(),
                c.getStatus(),
                c.getEmployee() == null ? null : c.getEmployee().getId(),
                c.getEmployee() == null ? null : c.getEmployee().getName(),
                c.getDescription());
    }
}
