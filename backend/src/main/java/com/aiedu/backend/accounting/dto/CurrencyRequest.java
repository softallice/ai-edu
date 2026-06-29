package com.aiedu.backend.accounting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 통화 생성/수정 요청. */
public record CurrencyRequest(
        @NotBlank @Size(max = 3) String code,
        @NotBlank String name,
        @Size(max = 10) String symbol,
        Integer decimals,
        Boolean active) {
}
