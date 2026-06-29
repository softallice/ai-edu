package com.aiedu.backend.accounting.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

/** 분개전표 수동 생성 요청. */
public record JournalEntryRequest(
        @Size(max = 20) String journalCode,
        @Size(max = 100) String ref,
        @NotNull LocalDate date,
        @NotEmpty @Valid List<JournalEntryLineRequest> lines) {
}
