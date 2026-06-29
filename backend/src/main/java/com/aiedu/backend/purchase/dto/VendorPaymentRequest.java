package com.aiedu.backend.purchase.dto;

import com.aiedu.backend.purchase.PaymentMethod;
import com.aiedu.backend.purchase.VendorPaymentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 구매대금지급 생성/수정 요청. */
public record VendorPaymentRequest(
        @NotNull Long supplierId,
        Long purchaseOrderId,
        LocalDate paymentDate,
        @NotNull BigDecimal amount,
        @NotNull PaymentMethod method,
        @NotNull VendorPaymentStatus status,
        @Size(max = 500) String note) {
}
