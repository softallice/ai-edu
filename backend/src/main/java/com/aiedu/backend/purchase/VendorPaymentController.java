package com.aiedu.backend.purchase;

import com.aiedu.backend.purchase.dto.VendorPaymentRequest;
import com.aiedu.backend.purchase.dto.VendorPaymentResponse;
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

/** 구매대금지급 REST API. 03.구매 / 대금지급결재 화면에서 사용. */
@RestController
@RequestMapping("/api/purchase/vendor-payments")
public class VendorPaymentController {

    private final VendorPaymentService service;

    public VendorPaymentController(VendorPaymentService service) {
        this.service = service;
    }

    @GetMapping
    public List<VendorPaymentResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) VendorPaymentStatus status,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return service.search(keyword, status, supplierId, dateFrom, dateTo);
    }

    @GetMapping("/{id}")
    public VendorPaymentResponse get(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public ResponseEntity<VendorPaymentResponse> create(@Valid @RequestBody VendorPaymentRequest req) {
        VendorPaymentResponse c = service.create(req);
        return ResponseEntity.created(URI.create("/api/purchase/vendor-payments/" + c.id())).body(c);
    }

    @PutMapping("/{id}")
    public VendorPaymentResponse update(@PathVariable Long id, @Valid @RequestBody VendorPaymentRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
