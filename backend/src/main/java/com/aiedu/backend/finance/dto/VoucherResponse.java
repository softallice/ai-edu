package com.aiedu.backend.finance.dto;

import com.aiedu.backend.finance.Voucher;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 전표 응답(프로젝트명 평탄화 포함). */
public record VoucherResponse(
        Long id,
        String code,
        LocalDate voucherDate,
        String account,
        BigDecimal debit,
        BigDecimal credit,
        String description,
        Long projectId,
        String projectName) {

    public static VoucherResponse from(Voucher v) {
        return new VoucherResponse(
                v.getId(),
                v.getCode(),
                v.getVoucherDate(),
                v.getAccount(),
                v.getDebit(),
                v.getCredit(),
                v.getDescription(),
                v.getProject() == null ? null : v.getProject().getId(),
                v.getProject() == null ? null : v.getProject().getName());
    }
}
