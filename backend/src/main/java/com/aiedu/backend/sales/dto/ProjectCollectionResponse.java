package com.aiedu.backend.sales.dto;

import com.aiedu.backend.sales.CollectionMethod;
import com.aiedu.backend.sales.CollectionStatus;
import com.aiedu.backend.sales.ProjectCollection;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 프로젝트수금 응답(거래처명·계약번호·프로젝트명 포함). */
public record ProjectCollectionResponse(
        Long id, String code,
        Long customerId, String customerName,
        Long contractId, String contractCode,
        Long projectId, String projectName,
        LocalDate plannedDate, LocalDate collectDate,
        BigDecimal amount, CollectionMethod method, CollectionStatus status,
        String note) {

    public static ProjectCollectionResponse from(ProjectCollection e) {
        return new ProjectCollectionResponse(
                e.getId(), e.getCode(),
                e.getCustomer().getId(), e.getCustomer().getName(),
                e.getContract() == null ? null : e.getContract().getId(),
                e.getContract() == null ? null : e.getContract().getCode(),
                e.getProject() == null ? null : e.getProject().getId(),
                e.getProject() == null ? null : e.getProject().getName(),
                e.getPlannedDate(), e.getCollectDate(),
                e.getAmount(), e.getMethod(), e.getStatus(),
                e.getNote());
    }
}
