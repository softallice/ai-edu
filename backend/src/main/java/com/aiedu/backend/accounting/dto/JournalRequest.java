package com.aiedu.backend.accounting.dto;

import com.aiedu.backend.accounting.JournalType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** 장부 생성/수정 요청. */
public record JournalRequest(
        @NotBlank @Size(max = 20) String code,
        @NotBlank @Size(max = 50) String name,
        @NotNull JournalType type,
        @Size(max = 10) String sequencePrefix,
        Boolean active) {
}
