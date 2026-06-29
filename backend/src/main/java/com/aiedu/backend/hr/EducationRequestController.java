package com.aiedu.backend.hr;

import com.aiedu.backend.hr.dto.EducationRequestRequest;
import com.aiedu.backend.hr.dto.EducationRequestResponse;
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

/** 교육신청 REST API. 05.인사 / 교육관리 화면에서 사용. */
@RestController
@RequestMapping("/api/hr/education-requests")
public class EducationRequestController {

    private final EducationRequestService service;

    public EducationRequestController(EducationRequestService service) {
        this.service = service;
    }

    @GetMapping
    public List<EducationRequestResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) EducationType eduType,
            @RequestParam(required = false) EducationStatus status,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return service.search(keyword, eduType, status, employeeId, dateFrom, dateTo);
    }

    @GetMapping("/{id}")
    public EducationRequestResponse get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<EducationRequestResponse> create(@Valid @RequestBody EducationRequestRequest req) {
        EducationRequestResponse er = service.create(req);
        return ResponseEntity.created(URI.create("/api/hr/education-requests/" + er.id())).body(er);
    }

    @PutMapping("/{id}")
    public EducationRequestResponse update(@PathVariable Long id,
            @Valid @RequestBody EducationRequestRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
