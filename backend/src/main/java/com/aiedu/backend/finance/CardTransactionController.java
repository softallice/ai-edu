package com.aiedu.backend.finance;

import com.aiedu.backend.finance.dto.CardTransactionRequest;
import com.aiedu.backend.finance.dto.CardTransactionResponse;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 법인카드 거래내역 REST API. 04.재무 / 법인카드 화면에서 사용. */
@RestController
@RequestMapping("/api/finance/card-transactions")
public class CardTransactionController {

    private final CardTransactionService service;

    public CardTransactionController(CardTransactionService service) {
        this.service = service;
    }

    @GetMapping
    public List<CardTransactionResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) CardTransactionStatus status,
            @RequestParam(required = false) String billingMonth,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return service.search(keyword, status, billingMonth, dateFrom, dateTo);
    }

    @GetMapping("/{id}")
    public CardTransactionResponse get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<CardTransactionResponse> create(
            @Valid @RequestBody CardTransactionRequest req) {
        CardTransactionResponse c = service.create(req);
        return ResponseEntity
                .created(URI.create("/api/finance/card-transactions/" + c.id()))
                .body(c);
    }

    @PutMapping("/{id}")
    public CardTransactionResponse update(@PathVariable Long id,
            @Valid @RequestBody CardTransactionRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
