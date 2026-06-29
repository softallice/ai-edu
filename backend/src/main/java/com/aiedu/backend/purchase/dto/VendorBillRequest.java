package com.aiedu.backend.purchase.dto;

import com.aiedu.backend.purchase.VendorBillStatus;
import com.aiedu.backend.purchase.VendorBillType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 매입세금계산서 생성/수정 요청. 세액 미입력 시 공급가액의 10%로 자동 산정. */
public record VendorBillRequest(
        @NotNull Long supplierId,
        Long purchaseOrderId,
        @NotNull VendorBillType billType,
        LocalDate issueDate,
        @NotNull BigDecimal supplyAmount,
        BigDecimal taxAmount,
        @NotNull VendorBillStatus status,
        @Size(max = 500) String note) {
}
