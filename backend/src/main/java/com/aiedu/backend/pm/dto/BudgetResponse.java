package com.aiedu.backend.pm.dto;

import com.aiedu.backend.pm.Budget;
import com.aiedu.backend.pm.BudgetType;
import java.math.BigDecimal;

/** 예산대실적 응답. 부서명·프로젝트명 평탄화 포함. 달성률·차이는 프론트에서 계산. */
public record BudgetResponse(
        Long id,
        String code,
        BudgetType budgetType,
        Long departmentId,
        String departmentName,
        Long projectId,
        String projectName,
        Integer fiscalYear,
        String category,
        BigDecimal plannedAmount,
        BigDecimal actualAmount,
        String note) {

    /** 엔티티 → 응답 DTO 변환. */
    public static BudgetResponse from(Budget b) {
        return new BudgetResponse(
                b.getId(),
                b.getCode(),
                b.getBudgetType(),
                b.getDepartment() == null ? null : b.getDepartment().getId(),
                b.getDepartment() == null ? null : b.getDepartment().getName(),
                b.getProject() == null ? null : b.getProject().getId(),
                b.getProject() == null ? null : b.getProject().getName(),
                b.getFiscalYear(),
                b.getCategory(),
                b.getPlannedAmount(),
                b.getActualAmount(),
                b.getNote());
    }
}
