package com.aiedu.backend.accounting.dto;

import com.aiedu.backend.accounting.FxRate;
import java.math.BigDecimal;
import java.time.LocalDate;

/** 환율 응답. */
public record FxRateResponse(Long id, String currencyCode, LocalDate rateDate, BigDecimal rate) {
    public static FxRateResponse from(FxRate r) {
        return new FxRateResponse(r.getId(), r.getCurrencyCode(), r.getRateDate(), r.getRate());
    }
}
