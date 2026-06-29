package com.aiedu.backend.accounting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/** 분개전표 라인 요청. */
public record JournalEntryLineRequest(
        @NotBlank @Size(max = 30) String accountCode,
        @Size(max = 200) String name,
        BigDecimal debit,
        BigDecimal credit,
        @Size(max = 10) String currencyCode,
        BigDecimal amountCurrency) {
}
