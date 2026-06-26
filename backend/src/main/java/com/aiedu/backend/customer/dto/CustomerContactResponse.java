package com.aiedu.backend.customer.dto;

import com.aiedu.backend.customer.CustomerContact;

/** 거래처 담당자 응답 본문. */
public record CustomerContactResponse(
        Long id,
        String department,
        String name,
        String telNo,
        String email) {

    public static CustomerContactResponse from(CustomerContact contact) {
        return new CustomerContactResponse(
                contact.getId(),
                contact.getDepartment(),
                contact.getName(),
                contact.getTelNo(),
                contact.getEmail());
    }
}
