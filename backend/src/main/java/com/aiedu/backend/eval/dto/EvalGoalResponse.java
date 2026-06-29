package com.aiedu.backend.eval.dto;

import com.aiedu.backend.eval.EvalGoal;
import com.aiedu.backend.eval.EvalGoalStatus;
import java.math.BigDecimal;

/** 업적목표 응답(직원명·사번 포함). */
public record EvalGoalResponse(
        Long id, String code,
        Long employeeId, String employeeNo, String employeeName,
        String period, String title,
        Integer weight, String targetValue,
        BigDecimal selfScore,
        EvalGoalStatus status, String note) {

    public static EvalGoalResponse from(EvalGoal e) {
        return new EvalGoalResponse(
                e.getId(), e.getCode(),
                e.getEmployee().getId(),
                e.getEmployee().getEmployeeNo(),
                e.getEmployee().getName(),
                e.getPeriod(), e.getTitle(),
                e.getWeight(), e.getTargetValue(),
                e.getSelfScore(),
                e.getStatus(), e.getNote());
    }
}
