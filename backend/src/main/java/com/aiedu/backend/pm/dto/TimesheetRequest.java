package com.aiedu.backend.pm.dto;

import com.aiedu.backend.pm.ActivityType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 활동시간 생성/수정 요청. */
public record TimesheetRequest(
        @NotNull Long employeeId,
        @NotNull Long projectId,
        @NotNull LocalDate workDate,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) @DecimalMax("24.0") BigDecimal hours,
        @NotNull ActivityType activityType,
        @Size(max = 500) String description,
        Boolean billable) {

    public boolean billableFlag() { return billable != null && billable; }
}
