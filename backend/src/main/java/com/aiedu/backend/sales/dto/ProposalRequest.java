package com.aiedu.backend.sales.dto;

import com.aiedu.backend.sales.ProposalStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 제안내역 생성/수정 요청. */
public record ProposalRequest(
        @NotNull Long customerId,
        Long projectId,
        LocalDate proposalDate,
        @NotBlank @Size(max = 200) String title,
        BigDecimal amount,
        @NotNull ProposalStatus status,
        @Size(max = 500) String note) {
}
