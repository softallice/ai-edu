package com.aiedu.backend.accounting;

import com.aiedu.backend.accounting.dto.JournalEntryRequest;
import com.aiedu.backend.accounting.dto.JournalEntryResponse;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 분개전표 REST API. /api/accounting/journal-entries */
@RestController
@RequestMapping("/api/accounting/journal-entries")
public class JournalEntryController {

    private final LedgerService ledgerService;

    public JournalEntryController(LedgerService ledgerService) {
        this.ledgerService = ledgerService;
    }

    @GetMapping
    public List<JournalEntryResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String journalCode,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return ledgerService.searchEntries(keyword, journalCode, dateFrom, dateTo).stream()
                .map(JournalEntryResponse::from).toList();
    }

    @GetMapping("/{id}")
    public JournalEntryResponse get(@PathVariable Long id) {
        return JournalEntryResponse.from(ledgerService.findEntry(id));
    }

    @PostMapping
    public ResponseEntity<JournalEntryResponse> create(@Valid @RequestBody JournalEntryRequest req) {
        JournalEntry entry = ledgerService.createManualEntry(req);
        return ResponseEntity.created(URI.create("/api/accounting/journal-entries/" + entry.getId()))
                .body(JournalEntryResponse.from(entry));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ledgerService.deleteEntry(id);
        return ResponseEntity.noContent().build();
    }
}
