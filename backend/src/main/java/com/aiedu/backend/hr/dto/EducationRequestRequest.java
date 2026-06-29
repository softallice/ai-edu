package com.aiedu.backend.hr.dto;

import com.aiedu.backend.hr.EducationStatus;
import com.aiedu.backend.hr.EducationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record EducationRequestRequest(
        @NotNull Long employeeId,
        @NotNull EducationType eduType,
        @NotBlank @Size(max = 200) String title,
        @Size(max = 200) String institution,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal cost,
        @NotNull EducationStatus status,
        @Size(max = 200) String result,
        @Size(max = 300) String note) {
}
