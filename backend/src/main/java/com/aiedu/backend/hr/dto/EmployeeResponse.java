package com.aiedu.backend.hr.dto;

import com.aiedu.backend.hr.Employee;
import com.aiedu.backend.hr.EmploymentType;
import com.aiedu.backend.hr.Gender;
import com.aiedu.backend.hr.Position;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 직원 응답(부서명 포함). */
public record EmployeeResponse(
        Long id, String employeeNo, String name, boolean active,
        Long departmentId, String departmentName,
        Position position, EmploymentType employmentType,
        LocalDate hireDate, LocalDate departureDate, BigDecimal costRate,
        String workEmail, String workPhone, String mobile, Gender gender, LocalDate birthday) {

    public static EmployeeResponse from(Employee e) {
        return new EmployeeResponse(
                e.getId(), e.getEmployeeNo(), e.getName(), e.isActive(),
                e.getDepartment() == null ? null : e.getDepartment().getId(),
                e.getDepartment() == null ? null : e.getDepartment().getName(),
                e.getPosition(), e.getEmploymentType(),
                e.getHireDate(), e.getDepartureDate(), e.getCostRate(),
                e.getWorkEmail(), e.getWorkPhone(), e.getMobile(), e.getGender(), e.getBirthday());
    }
}
