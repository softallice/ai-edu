package com.aiedu.backend.accounting.dto;

import com.aiedu.backend.accounting.Account;
import com.aiedu.backend.accounting.AccountType;

/** 계정과목 응답. */
public record AccountResponse(Long id, String code, String name, AccountType type, boolean active) {
    public static AccountResponse from(Account a) {
        return new AccountResponse(a.getId(), a.getCode(), a.getName(), a.getType(), a.isActive());
    }
}
