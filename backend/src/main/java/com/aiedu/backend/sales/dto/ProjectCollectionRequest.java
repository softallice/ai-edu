package com.aiedu.backend.sales.dto;

import com.aiedu.backend.sales.CollectionMethod;
import com.aiedu.backend.sales.CollectionStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 프로젝트수금 생성/수정 요청. */
public record ProjectCollectionRequest(
        @NotNull Long customerId,
        Long contractId,
        Long projectId,
        LocalDate plannedDate,
        LocalDate collectDate,
        @NotNull BigDecimal amount,
        @NotNull CollectionMethod method,
        @NotNull CollectionStatus status,
        @Size(max = 500) String note) {
}
