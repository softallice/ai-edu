package com.aiedu.backend.ga.dto;

import com.aiedu.backend.ga.SealStatus;
import com.aiedu.backend.ga.SealType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/** 인감신청 생성/수정 요청. */
public record SealRequestRequest(
        @NotNull Long employeeId,
        @NotNull SealType sealType,
        @NotBlank @Size(max = 200) String title,
        @Size(max = 500) String purpose,
        LocalDate useDate,
        @NotNull SealStatus status) {
}
