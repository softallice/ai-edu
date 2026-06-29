package com.aiedu.backend.accounting;

import com.aiedu.backend.accounting.dto.AccountRequest;
import com.aiedu.backend.accounting.dto.AccountResponse;
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

/** 계정과목 REST API. /api/accounting/accounts */
@RestController
@RequestMapping("/api/accounting/accounts")
public class AccountController {

    private final LedgerService ledgerService;

    public AccountController(LedgerService ledgerService) {
        this.ledgerService = ledgerService;
    }

    @GetMapping
    public List<AccountResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) AccountType type,
            @RequestParam(required = false) Boolean active) {
        return ledgerService.searchAccounts(keyword, type, active).stream()
                .map(AccountResponse::from).toList();
    }

    @GetMapping("/{id}")
    public AccountResponse get(@PathVariable Long id) {
        return AccountResponse.from(ledgerService.findAccount(id));
    }

    @PostMapping
    public ResponseEntity<AccountResponse> create(@Valid @RequestBody AccountRequest req) {
        Account a = ledgerService.createAccount(req.code(), req.name(), req.type());
        return ResponseEntity.created(URI.create("/api/accounting/accounts/" + a.getId()))
                .body(AccountResponse.from(a));
    }

    @PutMapping("/{id}")
    public AccountResponse update(@PathVariable Long id, @Valid @RequestBody AccountRequest req) {
        boolean active = req.active() != null ? req.active() : true;
        return AccountResponse.from(ledgerService.updateAccount(id, req.name(), req.type(), active));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ledgerService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }
}
