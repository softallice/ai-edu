package com.aiedu.backend.sales.dto;

import com.aiedu.backend.sales.Contract;
import com.aiedu.backend.sales.ContractLine;
import com.aiedu.backend.sales.ContractState;
import java.math.BigDecimal;

/** 계약품목현황(라인 레벨) 응답 — 계약 컨텍스트를 평탄화한 행. */
public record ContractLineRowResponse(
        Long lineId, Long contractId, String contractCode, String contractName,
        String customerName, ContractState state,
        String itemName, String spec, BigDecimal quantity, BigDecimal unitPrice, BigDecimal amount) {

    public static ContractLineRowResponse from(Contract c, ContractLine l) {
        return new ContractLineRowResponse(
                l.getId(), c.getId(), c.getCode(), c.getName(),
                c.getCustomer().getName(), c.getState(),
                l.getItemName(), l.getSpec(), l.getQuantity(), l.getUnitPrice(), l.getAmount());
    }
}
