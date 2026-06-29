package com.aiedu.backend.pm.dto;

import com.aiedu.backend.pm.BudgetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/** 예산대실적 생성/수정 요청. */
public record BudgetRequest(
        /** 예산 유형(TEAM/PROJECT). 필수. */
        @NotNull BudgetType budgetType,
        /** 부서 id. TEAM 유형일 때 사용. */
        Long departmentId,
        /** 프로젝트 id. PROJECT 유형일 때 사용. */
        Long projectId,
        /** 회계연도. 필수. */
        @NotNull Integer fiscalYear,
        /** 예산항목(인건비/경비/외주비 등). 필수. */
        @NotBlank @Size(max = 60) String category,
        /** 계획금액. 필수. */
        @NotNull BigDecimal plannedAmount,
        /** 실적금액(미입력 시 0). */
        BigDecimal actualAmount,
        /** 비고. */
        @Size(max = 300) String note) {
}
