package com.aiedu.backend.ga.dto;

import com.aiedu.backend.ga.ExpenseRequest;
import com.aiedu.backend.ga.ExpenseStatus;
import com.aiedu.backend.ga.ExpenseType;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 지출품의 응답(신청자명·비용유형 포함). */
public record ExpenseRequestResponse(
        Long id,
        String code,
        Long employeeId,
        String employeeName,
        ExpenseType expenseType,
        String title,
        BigDecimal amount,
        LocalDate requestDate,
        String reason,
        ExpenseStatus status) {

    public static ExpenseRequestResponse from(ExpenseRequest e) {
        return new ExpenseRequestResponse(
                e.getId(),
                e.getCode(),
                e.getEmployee().getId(),
                e.getEmployee().getName(),
                e.getExpenseType(),
                e.getTitle(),
                e.getAmount(),
                e.getRequestDate(),
                e.getReason(),
                e.getStatus());
    }
}
