package com.aiedu.backend.sales.dto;

import com.aiedu.backend.sales.PurchaseRequest;
import com.aiedu.backend.sales.PurchaseRequestStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 구매의뢰 응답(프로젝트명·의뢰자명 포함). */
public record PurchaseRequestResponse(
        Long id, String code,
        Long projectId, String projectName,
        Long requesterId, String requesterName,
        LocalDate requestDate, String itemName, Integer quantity, BigDecimal estimatedAmount,
        PurchaseRequestStatus status, String note) {

    public static PurchaseRequestResponse from(PurchaseRequest e) {
        return new PurchaseRequestResponse(
                e.getId(), e.getCode(),
                e.getProject() == null ? null : e.getProject().getId(),
                e.getProject() == null ? null : e.getProject().getName(),
                e.getRequester() == null ? null : e.getRequester().getId(),
                e.getRequester() == null ? null : e.getRequester().getName(),
                e.getRequestDate(), e.getItemName(), e.getQuantity(), e.getEstimatedAmount(),
                e.getStatus(), e.getNote());
    }
}
