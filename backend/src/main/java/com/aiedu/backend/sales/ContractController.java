package com.aiedu.backend.sales;

import com.aiedu.backend.sales.dto.ContractLineRowResponse;
import com.aiedu.backend.sales.dto.ContractRequest;
import com.aiedu.backend.sales.dto.ContractResponse;
import com.aiedu.backend.sales.dto.ContractSummaryResponse;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
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

/** 계약 REST API. 02.영업 / 계약관리 — 계약내역등록·계약품목현황·계약실적현황 화면에서 사용. */
@RestController
@RequestMapping("/api/sales/contracts")
public class ContractController {

    private final ContractService service;

    public ContractController(ContractService service) {
        this.service = service;
    }

    @GetMapping
    public List<ContractSummaryResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ContractState state,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Boolean active) {
        return service.search(keyword, state, customerId, active);
    }

    /** 계약품목현황(라인 평탄화). 리터럴 경로이므로 {@code /{id}} 보다 우선 매칭됩니다. */
    @GetMapping("/lines")
    public List<ContractLineRowResponse> lines(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ContractState state,
            @RequestParam(required = false) Long customerId) {
        return service.searchLines(keyword, state, customerId);
    }

    @GetMapping("/{id}")
    public ContractResponse get(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public ResponseEntity<ContractResponse> create(@Valid @RequestBody ContractRequest req) {
        ContractResponse c = service.create(req);
        return ResponseEntity.created(URI.create("/api/sales/contracts/" + c.id())).body(c);
    }

    @PutMapping("/{id}")
    public ContractResponse update(@PathVariable Long id, @Valid @RequestBody ContractRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
