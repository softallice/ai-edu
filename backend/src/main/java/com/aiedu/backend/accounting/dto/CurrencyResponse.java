package com.aiedu.backend.accounting.dto;

import com.aiedu.backend.accounting.Currency;

/** 통화 응답. */
public record CurrencyResponse(String code, String name, String symbol, int decimals, boolean active) {
    public static CurrencyResponse from(Currency c) {
        return new CurrencyResponse(c.getCode(), c.getName(), c.getSymbol(), c.getDecimals(), c.isActive());
    }
}
