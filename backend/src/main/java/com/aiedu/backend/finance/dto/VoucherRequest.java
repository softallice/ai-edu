package com.aiedu.backend.finance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 전표 생성/수정 요청. */
public record VoucherRequest(
        @NotNull LocalDate voucherDate,
        @NotBlank @Size(max = 60) String account,
        BigDecimal debit,
        BigDecimal credit,
        @Size(max = 300) String description,
        Long projectId) {
}
