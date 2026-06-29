package com.aiedu.backend.eval.dto;

import com.aiedu.backend.eval.Appraisal;
import com.aiedu.backend.eval.AppraisalStatus;
import java.math.BigDecimal;

/** 업적평가 응답(직원명·부서명·목표제목 포함). */
public record AppraisalResponse(
        Long id,
        String code,
        Long employeeId,
        String employeeName,
        String departmentName,
        Long evalGoalId,
        String evalGoalTitle,
        String period,
        BigDecimal selfScore,
        BigDecimal firstScore,
        BigDecimal secondScore,
        String grade,
        AppraisalStatus status,
        String comment) {

    public static AppraisalResponse from(Appraisal a) {
        String deptName = a.getEmployee().getDepartment() != null
                ? a.getEmployee().getDepartment().getName()
                : null;
        Long goalId = a.getEvalGoal() != null ? a.getEvalGoal().getId() : null;
        String goalTitle = a.getEvalGoal() != null ? a.getEvalGoal().getTitle() : null;
        return new AppraisalResponse(
                a.getId(),
                a.getCode(),
                a.getEmployee().getId(),
                a.getEmployee().getName(),
                deptName,
                goalId,
                goalTitle,
                a.getPeriod(),
                a.getSelfScore(),
                a.getFirstScore(),
                a.getSecondScore(),
                a.getGrade(),
                a.getStatus(),
                a.getComment());
    }
}
