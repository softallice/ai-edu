package com.aiedu.backend.accounting.dto;

import com.aiedu.backend.accounting.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** 계정과목 생성/수정 요청. */
public record AccountRequest(
        @NotBlank @Size(max = 30) String code,
        @NotBlank @Size(max = 100) String name,
        @NotNull AccountType type,
        Boolean active) {
}
