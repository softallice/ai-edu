package com.aiedu.backend.hr.dto;

import com.aiedu.backend.hr.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

/** 근태 생성/수정 요청. 출근·퇴근 둘 다 있으면 workHours는 서버에서 자동 계산. */
public record AttendanceRequest(
        @NotNull Long employeeId,
        @NotNull LocalDate workDate,
        LocalTime checkIn,
        LocalTime checkOut,
        BigDecimal workHours,
        @NotNull AttendanceStatus status,
        @Size(max = 300) String note) {
}
