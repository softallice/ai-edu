package com.aiedu.backend.accounting;

import com.aiedu.backend.common.ResourceNotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 통화·환율 서비스. */
@Service
@Transactional(readOnly = true)
public class CurrencyService {

    private final CurrencyRepository currencyRepository;
    private final FxRateRepository fxRateRepository;

    public CurrencyService(CurrencyRepository currencyRepository, FxRateRepository fxRateRepository) {
        this.currencyRepository = currencyRepository;
        this.fxRateRepository = fxRateRepository;
    }

    /** 통화 목록. */
    public List<Currency> listCurrencies() {
        return currencyRepository.findAll();
    }

    /** 통화 단건 조회. */
    public Currency findCurrency(String code) {
        return currencyRepository.findById(code)
                .orElseThrow(() -> new ResourceNotFoundException("통화를 찾을 수 없습니다. code=" + code));
    }

    /** 통화 등록. */
    @Transactional
    public Currency createCurrency(String code, String name, String symbol, int decimals) {
        if (currencyRepository.existsById(code)) {
            throw new IllegalArgumentException("이미 존재하는 통화 코드입니다: " + code);
        }
        return currencyRepository.save(Currency.create(code, name, symbol, decimals));
    }

    /** 통화 수정(코드 불변). */
    @Transactional
    public Currency updateCurrency(String code, String name, String symbol, boolean active) {
        Currency c = findCurrency(code);
        c.update(name, symbol, active);
        return c;
    }

    /** 환율 등록. */
    @Transactional
    public FxRate createFxRate(String currencyCode, LocalDate rateDate, BigDecimal rate) {
        findCurrency(currencyCode);
        return fxRateRepository.save(FxRate.create(currencyCode, rateDate, rate));
    }

    /** 특정 통화의 환율 목록(최신순). */
    public List<FxRate> listFxRates(String currencyCode) {
        return fxRateRepository.findByCurrencyCodeOrderByRateDateDesc(currencyCode);
    }
}
