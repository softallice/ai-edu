package com.aiedu.backend.hr.dto;

import com.aiedu.backend.hr.EducationRequest;
import com.aiedu.backend.hr.EducationStatus;
import com.aiedu.backend.hr.EducationType;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 교육신청 응답(직원명·부서명 포함). */
public record EducationRequestResponse(
        Long id, String code,
        Long employeeId, String employeeName, String departmentName,
        EducationType eduType,
        String title, String institution,
        LocalDate startDate, LocalDate endDate,
        BigDecimal cost,
        EducationStatus status,
        String result,
        String note) {

    public static EducationRequestResponse from(EducationRequest er) {
        String deptName = er.getEmployee().getDepartment() != null
                ? er.getEmployee().getDepartment().getName()
                : null;
        return new EducationRequestResponse(
                er.getId(), er.getCode(),
                er.getEmployee().getId(),
                er.getEmployee().getName(),
                deptName,
                er.getEduType(),
                er.getTitle(), er.getInstitution(),
                er.getStartDate(), er.getEndDate(),
                er.getCost(),
                er.getStatus(),
                er.getResult(),
                er.getNote());
    }
}
