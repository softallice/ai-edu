package com.aiedu.backend.sales.dto;

import com.aiedu.backend.sales.ContractLine;
import java.math.BigDecimal;

/** 계약 품목 응답. */
public record ContractLineResponse(
        Long id, String itemName, String spec, BigDecimal quantity, BigDecimal unitPrice, BigDecimal amount,
        String remark) {

    public static ContractLineResponse from(ContractLine l) {
        return new ContractLineResponse(l.getId(), l.getItemName(), l.getSpec(), l.getQuantity(), l.getUnitPrice(),
                l.getAmount(), l.getRemark());
    }
}
