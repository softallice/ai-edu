package com.aiedu.backend.sales.dto;

import com.aiedu.backend.sales.Contract;
import com.aiedu.backend.sales.ContractState;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** 계약 단건(품목 포함) 응답. */
public record ContractResponse(
        Long id, String code, String name,
        Long customerId, String customerName,
        Long projectId, String projectName,
        Long ownerId, String ownerName,
        ContractState state, LocalDate contractDate, LocalDate startDate, LocalDate endDate,
        String currency, String note, BigDecimal totalAmount, boolean active,
        List<ContractLineResponse> lines) {

    public static ContractResponse from(Contract c) {
        return new ContractResponse(
                c.getId(), c.getCode(), c.getName(),
                c.getCustomer().getId(), c.getCustomer().getName(),
                c.getProject() == null ? null : c.getProject().getId(),
                c.getProject() == null ? null : c.getProject().getName(),
                c.getOwner() == null ? null : c.getOwner().getId(),
                c.getOwner() == null ? null : c.getOwner().getName(),
                c.getState(), c.getContractDate(), c.getStartDate(), c.getEndDate(),
                c.getCurrency(), c.getNote(), c.totalAmount(), c.isActive(),
                c.getLines().stream().map(ContractLineResponse::from).toList());
    }
}
