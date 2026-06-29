package com.aiedu.backend.purchase.dto;

import com.aiedu.backend.purchase.VendorBill;
import com.aiedu.backend.purchase.VendorBillStatus;
import com.aiedu.backend.purchase.VendorBillType;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 매입세금계산서 응답(매입처명·발주번호 포함). */
public record VendorBillResponse(
        Long id, String code,
        Long supplierId, String supplierName,
        Long purchaseOrderId, String purchaseOrderCode,
        VendorBillType billType,
        LocalDate issueDate, BigDecimal supplyAmount, BigDecimal taxAmount, BigDecimal totalAmount,
        VendorBillStatus status, String note) {

    public static VendorBillResponse from(VendorBill b) {
        return new VendorBillResponse(
                b.getId(), b.getCode(),
                b.getSupplier().getId(), b.getSupplier().getName(),
                b.getPurchaseOrder() == null ? null : b.getPurchaseOrder().getId(),
                b.getPurchaseOrder() == null ? null : b.getPurchaseOrder().getCode(),
                b.getBillType(),
                b.getIssueDate(), b.getSupplyAmount(), b.getTaxAmount(), b.getTotalAmount(),
                b.getStatus(), b.getNote());
    }
}
