package com.aiedu.backend.hr.dto;

import com.aiedu.backend.hr.EmployeeRecord;
import com.aiedu.backend.hr.EmployeeRecordType;
import java.time.LocalDate;

/** 인적사항 응답(직원명·부서명 포함). */
public record EmployeeRecordResponse(
        Long id, String code,
        Long employeeId, String employeeName, String departmentName,
        EmployeeRecordType recordType,
        String title,
        String organization,
        LocalDate startDate,
        LocalDate endDate,
        String description,
        String note) {

    public static EmployeeRecordResponse from(EmployeeRecord er) {
        String deptName = er.getEmployee().getDepartment() != null
                ? er.getEmployee().getDepartment().getName()
                : null;
        return new EmployeeRecordResponse(
                er.getId(), er.getCode(),
                er.getEmployee().getId(),
                er.getEmployee().getName(),
                deptName,
                er.getRecordType(),
                er.getTitle(),
                er.getOrganization(),
                er.getStartDate(),
                er.getEndDate(),
                er.getDescription(),
                er.getNote());
    }
}
