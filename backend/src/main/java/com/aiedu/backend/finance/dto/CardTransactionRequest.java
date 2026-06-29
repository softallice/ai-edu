package com.aiedu.backend.finance.dto;

import com.aiedu.backend.finance.CardTransactionStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 법인카드 거래내역 생성/수정 요청. */
public record CardTransactionRequest(
        @NotBlank @Size(max = 30) String cardNo,
        @NotNull LocalDate usedDate,
        @Size(max = 100) String merchant,
        BigDecimal approvalAmount,
        BigDecimal purchaseAmount,
        @Size(max = 7) String billingMonth,
        @NotNull CardTransactionStatus status,
        Long employeeId,
        @Size(max = 300) String description) {
}
