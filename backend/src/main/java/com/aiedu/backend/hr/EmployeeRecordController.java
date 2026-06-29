package com.aiedu.backend.hr;

import com.aiedu.backend.hr.dto.EmployeeRecordRequest;
import com.aiedu.backend.hr.dto.EmployeeRecordResponse;
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

/** 인적사항 REST API. 05.인사 / 인적사항 화면에서 사용. */
@RestController
@RequestMapping("/api/hr/employee-records")
public class EmployeeRecordController {

    private final EmployeeRecordService service;

    public EmployeeRecordController(EmployeeRecordService service) {
        this.service = service;
    }

    @GetMapping
    public List<EmployeeRecordResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) EmployeeRecordType recordType,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return service.search(keyword, recordType, null, employeeId, dateFrom, dateTo);
    }

    @GetMapping("/{id}")
    public EmployeeRecordResponse get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<EmployeeRecordResponse> create(
            @Valid @RequestBody EmployeeRecordRequest req) {
        EmployeeRecordResponse er = service.create(req);
        return ResponseEntity.created(URI.create("/api/hr/employee-records/" + er.id())).body(er);
    }

    @PutMapping("/{id}")
    public EmployeeRecordResponse update(@PathVariable Long id,
            @Valid @RequestBody EmployeeRecordRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
