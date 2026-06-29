package com.aiedu.backend.hr.dto;

import com.aiedu.backend.hr.LeaveRequestStatus;
import com.aiedu.backend.hr.LeaveRequestType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 휴가/근로신청 생성/수정 요청. */
public record LeaveRequestRequest(
        @NotNull Long employeeId,
        @NotNull LeaveRequestType requestType,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        BigDecimal days,
        BigDecimal hours,
        @Size(max = 300) String reason,
        @NotNull LeaveRequestStatus status,
        @Size(max = 300) String note) {
}
