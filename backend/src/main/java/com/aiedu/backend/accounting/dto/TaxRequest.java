package com.aiedu.backend.accounting.dto;

import com.aiedu.backend.accounting.TaxAmountType;
import com.aiedu.backend.accounting.TaxUse;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** 세금 생성/수정 요청. */
public record TaxRequest(
        @NotBlank String code,
        @NotBlank String name,
        @NotNull TaxAmountType amountType,
        double amount,
        @NotNull TaxUse typeTaxUse,
        Long taxGroupId,
        Boolean active) {
}
