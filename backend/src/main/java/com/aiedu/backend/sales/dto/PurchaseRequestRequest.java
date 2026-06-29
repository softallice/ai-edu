package com.aiedu.backend.sales.dto;

import com.aiedu.backend.sales.PurchaseRequestStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 구매의뢰 생성/수정 요청. */
public record PurchaseRequestRequest(
        Long projectId,
        Long requesterId,
        LocalDate requestDate,
        @NotBlank @Size(max = 200) String itemName,
        Integer quantity,
        BigDecimal estimatedAmount,
        @NotNull PurchaseRequestStatus status,
        @Size(max = 500) String note) {
}
