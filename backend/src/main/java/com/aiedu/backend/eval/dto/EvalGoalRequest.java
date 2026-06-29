package com.aiedu.backend.eval.dto;

import com.aiedu.backend.eval.EvalGoalStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/** 업적목표 생성/수정 요청. */
public record EvalGoalRequest(
        @NotNull Long employeeId,
        @NotBlank @Size(max = 30) String period,
        @NotBlank @Size(max = 200) String title,
        @Min(0) @Max(100) Integer weight,
        @Size(max = 200) String targetValue,
        BigDecimal selfScore,
        @NotNull EvalGoalStatus status,
        @Size(max = 500) String note) {
}
