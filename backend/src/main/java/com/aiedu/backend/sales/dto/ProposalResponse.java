package com.aiedu.backend.sales.dto;

import com.aiedu.backend.sales.Proposal;
import com.aiedu.backend.sales.ProposalStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 제안내역 응답(거래처명·프로젝트명 포함). */
public record ProposalResponse(
        Long id, String code,
        Long customerId, String customerName,
        Long projectId, String projectName,
        LocalDate proposalDate, String title,
        BigDecimal amount, ProposalStatus status, String note) {

    public static ProposalResponse from(Proposal p) {
        return new ProposalResponse(
                p.getId(), p.getCode(),
                p.getCustomer().getId(), p.getCustomer().getName(),
                p.getProject() == null ? null : p.getProject().getId(),
                p.getProject() == null ? null : p.getProject().getName(),
                p.getProposalDate(), p.getTitle(),
                p.getAmount(), p.getStatus(), p.getNote());
    }
}
