package com.aiedu.backend.hr.dto;

import com.aiedu.backend.hr.EmployeeRecordType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/** 인적사항 생성/수정 요청. */
public record EmployeeRecordRequest(
        @NotNull Long employeeId,
        @NotNull EmployeeRecordType recordType,
        @NotBlank @Size(max = 200) String title,
        @Size(max = 200) String organization,
        LocalDate startDate,
        LocalDate endDate,
        @Size(max = 500) String description,
        @Size(max = 300) String note) {
}
