package com.aiedu.backend.hr.dto;

import com.aiedu.backend.hr.LeaveRequest;
import com.aiedu.backend.hr.LeaveRequestStatus;
import com.aiedu.backend.hr.LeaveRequestType;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 휴가/근로신청 응답(직원명·부서명 포함). */
public record LeaveRequestResponse(
        Long id, String code,
        Long employeeId, String employeeName, String departmentName,
        LeaveRequestType requestType,
        LocalDate startDate, LocalDate endDate,
        BigDecimal days, BigDecimal hours,
        String reason,
        LeaveRequestStatus status,
        String note) {

    public static LeaveRequestResponse from(LeaveRequest lr) {
        String deptName = lr.getEmployee().getDepartment() != null
                ? lr.getEmployee().getDepartment().getName()
                : null;
        return new LeaveRequestResponse(
                lr.getId(), lr.getCode(),
                lr.getEmployee().getId(),
                lr.getEmployee().getName(),
                deptName,
                lr.getRequestType(),
                lr.getStartDate(), lr.getEndDate(),
                lr.getDays(), lr.getHours(),
                lr.getReason(),
                lr.getStatus(),
                lr.getNote());
    }
}
