package com.aiedu.backend.accounting;

import com.aiedu.backend.accounting.dto.JournalRequest;
import com.aiedu.backend.accounting.dto.JournalResponse;
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

/** 장부 REST API. /api/accounting/journals */
@RestController
@RequestMapping("/api/accounting/journals")
public class JournalController {

    private final LedgerService ledgerService;

    public JournalController(LedgerService ledgerService) {
        this.ledgerService = ledgerService;
    }

    @GetMapping
    public List<JournalResponse> list() {
        return ledgerService.listJournals().stream().map(JournalResponse::from).toList();
    }

    @PostMapping
    public ResponseEntity<JournalResponse> create(@Valid @RequestBody JournalRequest req) {
        Journal j = ledgerService.createJournal(req.code(), req.name(), req.type(), req.sequencePrefix());
        return ResponseEntity.created(URI.create("/api/accounting/journals/" + j.getId()))
                .body(JournalResponse.from(j));
    }

    @PutMapping("/{id}")
    public JournalResponse update(@PathVariable Long id, @Valid @RequestBody JournalRequest req) {
        boolean active = req.active() != null ? req.active() : true;
        return JournalResponse.from(ledgerService.updateJournal(id, req.name(), req.type(), req.sequencePrefix(), active));
    }
}
