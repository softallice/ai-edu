package com.aiedu.backend.accounting.dto;

import com.aiedu.backend.accounting.Tax;
import com.aiedu.backend.accounting.TaxAmountType;
import com.aiedu.backend.accounting.TaxUse;

/** 세금 응답. */
public record TaxResponse(Long id, String code, String name, TaxAmountType amountType, double amount,
        TaxUse typeTaxUse, Long taxGroupId, String taxGroupName, boolean active) {
    public static TaxResponse from(Tax t) {
        return new TaxResponse(t.getId(), t.getCode(), t.getName(), t.getAmountType(), t.getAmount(),
                t.getTypeTaxUse(),
                t.getGroup() == null ? null : t.getGroup().getId(),
                t.getGroup() == null ? null : t.getGroup().getName(),
                t.isActive());
    }
}
