package com.aiedu.backend.sales.dto;

import com.aiedu.backend.sales.Contract;
import com.aiedu.backend.sales.ContractState;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 계약 목록(요약) 응답. */
public record ContractSummaryResponse(
        Long id, String code, String name,
        Long customerId, String customerName,
        String projectName, String ownerName,
        ContractState state, LocalDate contractDate, LocalDate startDate, LocalDate endDate,
        String currency, BigDecimal totalAmount, int lineCount, boolean active) {

    public static ContractSummaryResponse from(Contract c) {
        return new ContractSummaryResponse(
                c.getId(), c.getCode(), c.getName(),
                c.getCustomer().getId(), c.getCustomer().getName(),
                c.getProject() == null ? null : c.getProject().getName(),
                c.getOwner() == null ? null : c.getOwner().getName(),
                c.getState(), c.getContractDate(), c.getStartDate(), c.getEndDate(),
                c.getCurrency(), c.totalAmount(), c.getLines().size(), c.isActive());
    }
}
