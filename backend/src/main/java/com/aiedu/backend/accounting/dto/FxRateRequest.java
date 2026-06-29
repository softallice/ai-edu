package com.aiedu.backend.accounting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 환율 등록 요청. */
public record FxRateRequest(
        @NotBlank String currencyCode,
        @NotNull LocalDate rateDate,
        @NotNull BigDecimal rate) {
}
