package com.aiedu.backend.ga.dto;

import com.aiedu.backend.ga.SealRequest;
import com.aiedu.backend.ga.SealStatus;
import com.aiedu.backend.ga.SealType;
import java.time.LocalDate;

/** 인감신청 응답(신청자명·인감종류 포함). */
public record SealRequestResponse(
        Long id,
        String code,
        Long employeeId,
        String employeeName,
        SealType sealType,
        String title,
        String purpose,
        LocalDate useDate,
        SealStatus status) {

    public static SealRequestResponse from(SealRequest e) {
        return new SealRequestResponse(
                e.getId(),
                e.getCode(),
                e.getEmployee().getId(),
                e.getEmployee().getName(),
                e.getSealType(),
                e.getTitle(),
                e.getPurpose(),
                e.getUseDate(),
                e.getStatus());
    }
}
