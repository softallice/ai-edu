package com.aiedu.backend.purchase.dto;

import com.aiedu.backend.purchase.PurchaseOrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 구매발주 생성/수정 요청. */
public record PurchaseOrderRequest(
        @NotNull Long supplierId,
        Long projectId,
        LocalDate orderDate,
        LocalDate deliveryDate,
        @NotNull BigDecimal amount,
        @NotNull PurchaseOrderStatus status,
        @Size(max = 500) String note) {
}
