package com.aiedu.backend.ga;

import com.aiedu.backend.ga.dto.ExpenseRequestRequest;
import com.aiedu.backend.ga.dto.ExpenseRequestResponse;
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

/** 지출품의 REST API. 07.총무 / 지출품의 화면에서 사용. */
@RestController
@RequestMapping("/api/ga/expense-requests")
public class ExpenseRequestController {

    private final ExpenseRequestService service;

    public ExpenseRequestController(ExpenseRequestService service) {
        this.service = service;
    }

    @GetMapping
    public List<ExpenseRequestResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) ExpenseType expenseType,
            @RequestParam(required = false) ExpenseStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return service.search(keyword, employeeId, expenseType, status, dateFrom, dateTo);
    }

    @GetMapping("/{id}")
    public ExpenseRequestResponse get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<ExpenseRequestResponse> create(@Valid @RequestBody ExpenseRequestRequest req) {
        ExpenseRequestResponse c = service.create(req);
        return ResponseEntity.created(URI.create("/api/ga/expense-requests/" + c.id())).body(c);
    }

    @PutMapping("/{id}")
    public ExpenseRequestResponse update(@PathVariable Long id,
            @Valid @RequestBody ExpenseRequestRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
