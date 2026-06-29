package com.aiedu.backend.hr.dto;

import com.aiedu.backend.hr.PayslipStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/** 급여명세 생성/수정 요청. */
public record PayslipRequest(
        @NotNull Long employeeId,
        @NotBlank @Size(max = 7) String payMonth,
        BigDecimal baseSalary,
        BigDecimal allowance,
        BigDecimal bonus,
        BigDecimal deduction,
        @NotNull PayslipStatus status,
        @Size(max = 300) String note) {
}
