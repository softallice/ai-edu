package com.aiedu.backend.accounting;

import com.aiedu.backend.accounting.dto.CurrencyRequest;
import com.aiedu.backend.accounting.dto.CurrencyResponse;
import com.aiedu.backend.accounting.dto.FxRateRequest;
import com.aiedu.backend.accounting.dto.FxRateResponse;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 통화·환율 REST API. */
@RestController
@RequestMapping("/api/accounting")
public class CurrencyController {

    private final CurrencyService currencyService;

    public CurrencyController(CurrencyService currencyService) {
        this.currencyService = currencyService;
    }

    @GetMapping("/currencies")
    public List<CurrencyResponse> listCurrencies() {
        return currencyService.listCurrencies().stream().map(CurrencyResponse::from).toList();
    }

    @PostMapping("/currencies")
    public ResponseEntity<CurrencyResponse> createCurrency(@Valid @RequestBody CurrencyRequest req) {
        int decimals = req.decimals() != null ? req.decimals() : 2;
        Currency c = currencyService.createCurrency(req.code(), req.name(), req.symbol(), decimals);
        return ResponseEntity.created(URI.create("/api/accounting/currencies/" + c.getCode()))
                .body(CurrencyResponse.from(c));
    }

    @PutMapping("/currencies/{code}")
    public CurrencyResponse updateCurrency(@PathVariable String code, @Valid @RequestBody CurrencyRequest req) {
        boolean active = req.active() != null ? req.active() : true;
        return CurrencyResponse.from(currencyService.updateCurrency(code, req.name(), req.symbol(), active));
    }

    @GetMapping("/fx-rates")
    public List<FxRateResponse> listFxRates(@RequestParam(required = false) String currencyCode) {
        if (currencyCode == null || currencyCode.isBlank()) return List.of();
        return currencyService.listFxRates(currencyCode).stream().map(FxRateResponse::from).toList();
    }

    @PostMapping("/fx-rates")
    public ResponseEntity<FxRateResponse> createFxRate(@Valid @RequestBody FxRateRequest req) {
        FxRate rate = currencyService.createFxRate(req.currencyCode(), req.rateDate(), req.rate());
        return ResponseEntity.created(URI.create("/api/accounting/fx-rates/" + rate.getId()))
                .body(FxRateResponse.from(rate));
    }
}
