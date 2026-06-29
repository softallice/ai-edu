package com.aiedu.backend.hr.dto;

import com.aiedu.backend.hr.EmploymentType;
import com.aiedu.backend.hr.Gender;
import com.aiedu.backend.hr.Position;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 직원 생성/수정 요청. */
public record EmployeeRequest(
        @NotBlank @Size(max = 30) String employeeNo,
        @NotBlank @Size(max = 100) String name,
        Boolean active,
        Long departmentId,
        @NotNull Position position,
        @NotNull EmploymentType employmentType,
        LocalDate hireDate,
        LocalDate departureDate,
        BigDecimal costRate,
        @Email @Size(max = 200) String workEmail,
        @Size(max = 30) String workPhone,
        @Size(max = 30) String mobile,
        Gender gender,
        LocalDate birthday) {

    public boolean activeFlag() { return active == null || active; }
    public BigDecimal costRateOrZero() { return costRate == null ? BigDecimal.ZERO : costRate; }
}
