package com.aiedu.backend.sales;

import com.aiedu.backend.sales.dto.ProposalRequest;
import com.aiedu.backend.sales.dto.ProposalResponse;
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

/** 제안내역 REST API. 02.영업 / 제안내역 화면에서 사용. */
@RestController
@RequestMapping("/api/sales/proposals")
public class ProposalController {

    private final ProposalService service;

    public ProposalController(ProposalService service) {
        this.service = service;
    }

    @GetMapping
    public List<ProposalResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ProposalStatus status,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return service.search(keyword, status, customerId, dateFrom, dateTo);
    }

    @GetMapping("/{id}")
    public ProposalResponse get(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public ResponseEntity<ProposalResponse> create(@Valid @RequestBody ProposalRequest req) {
        ProposalResponse p = service.create(req);
        return ResponseEntity.created(URI.create("/api/sales/proposals/" + p.id())).body(p);
    }

    @PutMapping("/{id}")
    public ProposalResponse update(@PathVariable Long id, @Valid @RequestBody ProposalRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
