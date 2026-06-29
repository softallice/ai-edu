package com.aiedu.backend.sales.dto;

import com.aiedu.backend.sales.TaxInvoice;
import com.aiedu.backend.sales.TaxInvoiceStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 세금계산서 응답(거래처명·계약번호 포함). */
public record TaxInvoiceResponse(
        Long id, String code,
        Long customerId, String customerName,
        Long contractId, String contractCode,
        LocalDate issueDate, BigDecimal supplyAmount, BigDecimal taxAmount, BigDecimal totalAmount,
        TaxInvoiceStatus status, String note) {

    public static TaxInvoiceResponse from(TaxInvoice t) {
        return new TaxInvoiceResponse(
                t.getId(), t.getCode(),
                t.getCustomer().getId(), t.getCustomer().getName(),
                t.getContract() == null ? null : t.getContract().getId(),
                t.getContract() == null ? null : t.getContract().getCode(),
                t.getIssueDate(), t.getSupplyAmount(), t.getTaxAmount(), t.getTotalAmount(),
                t.getStatus(), t.getNote());
    }
}
