package com.aiedu.backend.accounting.dto;

import com.aiedu.backend.accounting.JournalEntryLine;
import java.math.BigDecimal;

/** 분개전표 라인 응답. */
public record JournalEntryLineResponse(
        Long id,
        Long accountId,
        String accountCode,
        String accountName,
        String name,
        BigDecimal debit,
        BigDecimal credit,
        String currencyCode,
        BigDecimal amountCurrency) {
    public static JournalEntryLineResponse from(JournalEntryLine l) {
        return new JournalEntryLineResponse(
                l.getId(),
                l.getAccount().getId(),
                l.getAccount().getCode(),
                l.getAccount().getName(),
                l.getName(),
                l.getDebit(),
                l.getCredit(),
                l.getCurrencyCode(),
                l.getAmountCurrency());
    }
}
