package com.aiedu.backend.purchase.dto;

import com.aiedu.backend.purchase.PurchaseOrder;
import com.aiedu.backend.purchase.PurchaseOrderStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 구매발주 응답(공급처명·프로젝트명 포함). */
public record PurchaseOrderResponse(
        Long id, String code,
        Long supplierId, String supplierName,
        Long projectId, String projectName,
        LocalDate orderDate, LocalDate deliveryDate,
        BigDecimal amount,
        PurchaseOrderStatus status, String note) {

    public static PurchaseOrderResponse from(PurchaseOrder e) {
        return new PurchaseOrderResponse(
                e.getId(), e.getCode(),
                e.getSupplier().getId(), e.getSupplier().getName(),
                e.getProject() == null ? null : e.getProject().getId(),
                e.getProject() == null ? null : e.getProject().getName(),
                e.getOrderDate(), e.getDeliveryDate(),
                e.getAmount(),
                e.getStatus(), e.getNote());
    }
}
