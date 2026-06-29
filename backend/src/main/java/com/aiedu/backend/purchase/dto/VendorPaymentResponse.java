package com.aiedu.backend.purchase.dto;

import com.aiedu.backend.purchase.PaymentMethod;
import com.aiedu.backend.purchase.VendorPayment;
import com.aiedu.backend.purchase.VendorPaymentStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 구매대금지급 응답(거래처명·발주번호 포함). */
public record VendorPaymentResponse(
        Long id, String code,
        Long supplierId, String supplierName,
        Long purchaseOrderId, String purchaseOrderCode,
        LocalDate paymentDate, BigDecimal amount,
        PaymentMethod method, VendorPaymentStatus status, String note) {

    public static VendorPaymentResponse from(VendorPayment p) {
        return new VendorPaymentResponse(
                p.getId(), p.getCode(),
                p.getSupplier().getId(), p.getSupplier().getName(),
                p.getPurchaseOrder() == null ? null : p.getPurchaseOrder().getId(),
                p.getPurchaseOrder() == null ? null : p.getPurchaseOrder().getCode(),
                p.getPaymentDate(), p.getAmount(),
                p.getMethod(), p.getStatus(), p.getNote());
    }
}
