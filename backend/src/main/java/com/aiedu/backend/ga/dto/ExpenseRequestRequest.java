package com.aiedu.backend.ga.dto;

import com.aiedu.backend.ga.ExpenseStatus;
import com.aiedu.backend.ga.ExpenseType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 지출품의 생성/수정 요청. */
public record ExpenseRequestRequest(
        @NotNull Long employeeId,
        @NotNull ExpenseType expenseType,
        @NotBlank @Size(max = 200) String title,
        @NotNull BigDecimal amount,
        LocalDate requestDate,
        @Size(max = 500) String reason,
        @NotNull ExpenseStatus status) {
}
