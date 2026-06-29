package com.aiedu.backend.accounting;

import com.aiedu.backend.accounting.dto.TaxGroupRequest;
import com.aiedu.backend.accounting.dto.TaxGroupResponse;
import com.aiedu.backend.accounting.dto.TaxRequest;
import com.aiedu.backend.accounting.dto.TaxResponse;
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
import org.springframework.web.bind.annotation.RestController;

/** 세금·세금그룹 REST API. */
@RestController
@RequestMapping("/api/accounting")
public class TaxController {

    private final TaxService taxService;

    public TaxController(TaxService taxService) {
        this.taxService = taxService;
    }

    @GetMapping("/tax-groups")
    public List<TaxGroupResponse> listTaxGroups() {
        return taxService.listTaxGroups().stream().map(TaxGroupResponse::from).toList();
    }

    @PostMapping("/tax-groups")
    public ResponseEntity<TaxGroupResponse> createTaxGroup(@Valid @RequestBody TaxGroupRequest req) {
        TaxGroup g = taxService.createTaxGroup(req.code(), req.name());
        return ResponseEntity.created(URI.create("/api/accounting/tax-groups/" + g.getId()))
                .body(TaxGroupResponse.from(g));
    }

    @PutMapping("/tax-groups/{id}")
    public TaxGroupResponse updateTaxGroup(@PathVariable Long id, @Valid @RequestBody TaxGroupRequest req) {
        boolean active = req.active() != null ? req.active() : true;
        return TaxGroupResponse.from(taxService.updateTaxGroup(id, req.name(), active));
    }

    @GetMapping("/taxes")
    public List<TaxResponse> listTaxes() {
        return taxService.listTaxes().stream().map(TaxResponse::from).toList();
    }

    @PostMapping("/taxes")
    public ResponseEntity<TaxResponse> createTax(@Valid @RequestBody TaxRequest req) {
        Tax t = taxService.createTax(req.code(), req.name(), req.amountType(), req.amount(),
                req.typeTaxUse(), req.taxGroupId());
        return ResponseEntity.created(URI.create("/api/accounting/taxes/" + t.getId()))
                .body(TaxResponse.from(t));
    }

    @PutMapping("/taxes/{id}")
    public TaxResponse updateTax(@PathVariable Long id, @Valid @RequestBody TaxRequest req) {
        boolean active = req.active() != null ? req.active() : true;
        return TaxResponse.from(taxService.updateTax(id, req.name(), req.amountType(), req.amount(), active));
    }
}
