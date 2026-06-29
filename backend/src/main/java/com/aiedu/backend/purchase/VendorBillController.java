package com.aiedu.backend.purchase;

import com.aiedu.backend.purchase.dto.VendorBillRequest;
import com.aiedu.backend.purchase.dto.VendorBillResponse;
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

/** 매입세금계산서 REST API. 03.구매 / 매입세금계산서 — 상품·용역·현황 화면에서 사용. */
@RestController
@RequestMapping("/api/purchase/vendor-bills")
public class VendorBillController {

    private final VendorBillService service;

    public VendorBillController(VendorBillService service) {
        this.service = service;
    }

    @GetMapping
    public List<VendorBillResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) VendorBillStatus status,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) VendorBillType billType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return service.search(keyword, status, supplierId, billType, dateFrom, dateTo);
    }

    @GetMapping("/{id}")
    public VendorBillResponse get(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public ResponseEntity<VendorBillResponse> create(@Valid @RequestBody VendorBillRequest req) {
        VendorBillResponse b = service.create(req);
        return ResponseEntity.created(URI.create("/api/purchase/vendor-bills/" + b.id())).body(b);
    }

    @PutMapping("/{id}")
    public VendorBillResponse update(@PathVariable Long id, @Valid @RequestBody VendorBillRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
