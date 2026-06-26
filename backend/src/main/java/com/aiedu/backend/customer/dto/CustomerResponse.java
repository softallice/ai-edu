package com.aiedu.backend.customer.dto;

import com.aiedu.backend.customer.Customer;
import com.aiedu.backend.customer.TradeType;
import java.time.LocalDate;
import java.util.List;

/**
 * 거래처 상세 응답 본문(담당자 목록 포함).
 *
 * <p>엔티티를 외부에 직접 노출하지 않기 위한 표현 계층 DTO입니다. 레거시 SEARCH01(거래처 상세 +
 * 담당자 목록)에 대응합니다.
 */
public record CustomerResponse(
        Long id,
        String code,
        String businessRegNo,
        String name,
        String shortName,
        TradeType tradeType,
        String representativeName,
        String corporateRegNo,
        String businessCondition,
        String businessItem,
        String postNo,
        String address1,
        String address2,
        String telNo,
        String faxNo,
        String email,
        String taxType,
        LocalDate foundDate,
        LocalDate tradeStartDate,
        LocalDate tradeEndDate,
        boolean active,
        boolean electronicContract,
        List<CustomerContactResponse> contacts) {

    public static CustomerResponse from(Customer c) {
        List<CustomerContactResponse> contacts = c.getContacts().stream()
                .map(CustomerContactResponse::from)
                .toList();
        return new CustomerResponse(
                c.getId(),
                c.getCode(),
                c.getBusinessRegNo(),
                c.getName(),
                c.getShortName(),
                c.getTradeType(),
                c.getRepresentativeName(),
                c.getCorporateRegNo(),
                c.getBusinessCondition(),
                c.getBusinessItem(),
                c.getPostNo(),
                c.getAddress1(),
                c.getAddress2(),
                c.getTelNo(),
                c.getFaxNo(),
                c.getEmail(),
                c.getTaxType(),
                c.getFoundDate(),
                c.getTradeStartDate(),
                c.getTradeEndDate(),
                c.isActive(),
                c.isElectronicContract(),
                contacts);
    }
}
