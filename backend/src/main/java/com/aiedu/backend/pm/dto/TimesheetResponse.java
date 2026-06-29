package com.aiedu.backend.pm.dto;

import com.aiedu.backend.pm.ActivityType;
import com.aiedu.backend.pm.Timesheet;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** 활동시간 응답(직원명·프로젝트명 포함). */
public record TimesheetResponse(
        Long id,
        Long employeeId, String employeeName,
        Long projectId, String projectCode, String projectName,
        LocalDate workDate, BigDecimal hours, ActivityType activityType,
        String description, boolean billable, boolean validated, LocalDateTime validatedAt) {

    public static TimesheetResponse from(Timesheet t) {
        return new TimesheetResponse(
                t.getId(),
                t.getEmployee().getId(), t.getEmployee().getName(),
                t.getProject().getId(), t.getProject().getCode(), t.getProject().getName(),
                t.getWorkDate(), t.getHours(), t.getActivityType(),
                t.getDescription(), t.isBillable(), t.isValidated(), t.getValidatedAt());
    }
}
