package com.aiedu.backend.sales.dto;

import com.aiedu.backend.sales.ContractState;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

/** 계약 생성/수정 요청(품목 포함). 코드는 서버에서 채번. */
public record ContractRequest(
        @NotBlank @Size(max = 200) String name,
        @NotNull Long customerId,
        Long projectId,
        Long ownerId,
        @NotNull ContractState state,
        LocalDate contractDate,
        LocalDate startDate,
        LocalDate endDate,
        @Size(max = 10) String currency,
        @Size(max = 1000) String note,
        Boolean active,
        @Valid List<ContractLineRequest> lines) {

    public boolean activeFlag() { return active == null || active; }
    public String currencyOrDefault() { return currency == null || currency.isBlank() ? "KRW" : currency; }
    public List<ContractLineRequest> linesOrEmpty() { return lines == null ? List.of() : lines; }
}
