package com.aiedu.backend.sales;

import com.aiedu.backend.sales.dto.PurchaseRequestRequest;
import com.aiedu.backend.sales.dto.PurchaseRequestResponse;
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

/** 구매의뢰 REST API. 02.영업 / 구매의뢰 화면에서 사용. */
@RestController
@RequestMapping("/api/sales/purchase-requests")
public class PurchaseRequestController {

    private final PurchaseRequestService service;

    public PurchaseRequestController(PurchaseRequestService service) {
        this.service = service;
    }

    @GetMapping
    public List<PurchaseRequestResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) PurchaseRequestStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return service.search(keyword, status, dateFrom, dateTo);
    }

    @GetMapping("/{id}")
    public PurchaseRequestResponse get(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public ResponseEntity<PurchaseRequestResponse> create(@Valid @RequestBody PurchaseRequestRequest req) {
        PurchaseRequestResponse r = service.create(req);
        return ResponseEntity.created(URI.create("/api/sales/purchase-requests/" + r.id())).body(r);
    }

    @PutMapping("/{id}")
    public PurchaseRequestResponse update(@PathVariable Long id, @Valid @RequestBody PurchaseRequestRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
