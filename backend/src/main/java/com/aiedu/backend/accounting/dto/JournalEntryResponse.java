package com.aiedu.backend.accounting.dto;

import com.aiedu.backend.accounting.JournalEntry;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** 분개전표 응답(라인 포함 + 차변합/대변합). */
public record JournalEntryResponse(
        Long id,
        String name,
        LocalDate entryDate,
        String ref,
        Long journalId,
        String journalCode,
        String journalName,
        String sourceType,
        String sourceId,
        List<JournalEntryLineResponse> lines,
        BigDecimal totalDebit,
        BigDecimal totalCredit) {

    public static JournalEntryResponse from(JournalEntry e) {
        List<JournalEntryLineResponse> lineResponses = e.getLines().stream()
                .map(JournalEntryLineResponse::from)
                .toList();
        BigDecimal totalDebit = lineResponses.stream()
                .map(JournalEntryLineResponse::debit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCredit = lineResponses.stream()
                .map(JournalEntryLineResponse::credit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new JournalEntryResponse(
                e.getId(),
                e.getName(),
                e.getEntryDate(),
                e.getRef(),
                e.getJournal() == null ? null : e.getJournal().getId(),
                e.getJournal() == null ? null : e.getJournal().getCode(),
                e.getJournal() == null ? null : e.getJournal().getName(),
                e.getSourceType(),
                e.getSourceId(),
                lineResponses,
                totalDebit,
                totalCredit);
    }
}
