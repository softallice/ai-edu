package com.aiedu.backend.sales;

import com.aiedu.backend.sales.dto.TaxInvoiceRequest;
import com.aiedu.backend.sales.dto.TaxInvoiceResponse;
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

/** 매출세금계산서 REST API. 02.영업 / 세금계산서 — 발행·발행현황 화면에서 사용. */
@RestController
@RequestMapping("/api/sales/tax-invoices")
public class TaxInvoiceController {

    private final TaxInvoiceService service;

    public TaxInvoiceController(TaxInvoiceService service) {
        this.service = service;
    }

    @GetMapping
    public List<TaxInvoiceResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) TaxInvoiceStatus status,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return service.search(keyword, status, customerId, dateFrom, dateTo);
    }

    @GetMapping("/{id}")
    public TaxInvoiceResponse get(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public ResponseEntity<TaxInvoiceResponse> create(@Valid @RequestBody TaxInvoiceRequest req) {
        TaxInvoiceResponse c = service.create(req);
        return ResponseEntity.created(URI.create("/api/sales/tax-invoices/" + c.id())).body(c);
    }

    @PutMapping("/{id}")
    public TaxInvoiceResponse update(@PathVariable Long id, @Valid @RequestBody TaxInvoiceRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
