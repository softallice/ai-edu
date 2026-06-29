package com.aiedu.backend.hr.dto;

import com.aiedu.backend.hr.Attendance;
import com.aiedu.backend.hr.AttendanceStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

/** 근태 응답(직원명·사번 포함). */
public record AttendanceResponse(
        Long id, String code,
        Long employeeId, String employeeNo, String employeeName,
        LocalDate workDate,
        LocalTime checkIn, LocalTime checkOut,
        BigDecimal workHours,
        AttendanceStatus status,
        String note) {

    public static AttendanceResponse from(Attendance a) {
        return new AttendanceResponse(
                a.getId(), a.getCode(),
                a.getEmployee().getId(),
                a.getEmployee().getEmployeeNo(),
                a.getEmployee().getName(),
                a.getWorkDate(),
                a.getCheckIn(), a.getCheckOut(),
                a.getWorkHours(),
                a.getStatus(),
                a.getNote());
    }
}
