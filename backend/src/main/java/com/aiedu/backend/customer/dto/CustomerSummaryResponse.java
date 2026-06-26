package com.aiedu.backend.customer.dto;

import com.aiedu.backend.customer.Customer;
import com.aiedu.backend.customer.TradeType;

/**
 * 거래처 목록(요약) 응답 본문.
 *
 * <p>목록 화면에는 담당자 같은 무거운 연관 데이터를 싣지 않는다는 API 설계 원칙에 따라
 * 상세({@link CustomerResponse})와 분리한 경량 DTO입니다. 레거시 SEARCH00(목록)에 대응합니다.
 */
public record CustomerSummaryResponse(
        Long id,
        String code,
        String name,
        TradeType tradeType,
        String representativeName,
        String businessRegNo,
        boolean active) {

    public static CustomerSummaryResponse from(Customer c) {
        return new CustomerSummaryResponse(
                c.getId(),
                c.getCode(),
                c.getName(),
                c.getTradeType(),
                c.getRepresentativeName(),
                c.getBusinessRegNo(),
                c.isActive());
    }
}
