package com.aiedu.backend.hr;

import com.aiedu.backend.hr.dto.PayslipRequest;
import com.aiedu.backend.hr.dto.PayslipResponse;
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

/** 급여명세 REST API. 05.인사 / 급여조회 화면에서 사용. */
@RestController
@RequestMapping("/api/hr/payslips")
public class PayslipController {

    private final PayslipService service;

    public PayslipController(PayslipService service) {
        this.service = service;
    }

    @GetMapping
    public List<PayslipResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) PayslipStatus status,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String payMonthFrom,
            @RequestParam(required = false) String payMonthTo) {
        return service.search(keyword, status, employeeId, payMonthFrom, payMonthTo);
    }

    @GetMapping("/{id}")
    public PayslipResponse get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<PayslipResponse> create(@Valid @RequestBody PayslipRequest req) {
        PayslipResponse p = service.create(req);
        return ResponseEntity.created(URI.create("/api/hr/payslips/" + p.id())).body(p);
    }

    @PutMapping("/{id}")
    public PayslipResponse update(@PathVariable Long id, @Valid @RequestBody PayslipRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
