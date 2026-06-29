package com.aiedu.backend.sales.dto;

import com.aiedu.backend.sales.TaxInvoiceStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 세금계산서 생성/수정 요청. 세액 미입력 시 공급가액의 10%로 자동 산정. */
public record TaxInvoiceRequest(
        @NotNull Long customerId,
        Long contractId,
        LocalDate issueDate,
        @NotNull BigDecimal supplyAmount,
        BigDecimal taxAmount,
        @NotNull TaxInvoiceStatus status,
        @Size(max = 500) String note) {
}
