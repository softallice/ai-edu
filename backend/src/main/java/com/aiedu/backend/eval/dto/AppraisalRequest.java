package com.aiedu.backend.eval.dto;

import com.aiedu.backend.eval.AppraisalStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/** 업적평가 생성/수정 요청. */
public record AppraisalRequest(
        @NotNull Long employeeId,
        Long evalGoalId,
        @NotBlank @Size(max = 30) String period,
        BigDecimal selfScore,
        BigDecimal firstScore,
        BigDecimal secondScore,
        @Size(max = 5) String grade,
        @NotNull AppraisalStatus status,
        @Size(max = 500) String comment) {
}
