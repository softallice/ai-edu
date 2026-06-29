package com.aiedu.backend.ga;

import com.aiedu.backend.ga.dto.SealRequestRequest;
import com.aiedu.backend.ga.dto.SealRequestResponse;
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

/** 인감신청 REST API. 07.총무 / 인감관리 화면에서 사용. */
@RestController
@RequestMapping("/api/ga/seal-requests")
public class SealRequestController {

    private final SealRequestService service;

    public SealRequestController(SealRequestService service) {
        this.service = service;
    }

    @GetMapping
    public List<SealRequestResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) SealType sealType,
            @RequestParam(required = false) SealStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return service.search(keyword, employeeId, sealType, status, dateFrom, dateTo);
    }

    @GetMapping("/{id}")
    public SealRequestResponse get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<SealRequestResponse> create(@Valid @RequestBody SealRequestRequest req) {
        SealRequestResponse c = service.create(req);
        return ResponseEntity.created(URI.create("/api/ga/seal-requests/" + c.id())).body(c);
    }

    @PutMapping("/{id}")
    public SealRequestResponse update(@PathVariable Long id,
            @Valid @RequestBody SealRequestRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
