package com.aiedu.backend.hr;

import com.aiedu.backend.hr.dto.LeaveRequestRequest;
import com.aiedu.backend.hr.dto.LeaveRequestResponse;
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

/** 휴가/근로신청 REST API. 05.인사 / 근태관리 화면에서 사용. */
@RestController
@RequestMapping("/api/hr/leave-requests")
public class LeaveRequestController {

    private final LeaveRequestService service;

    public LeaveRequestController(LeaveRequestService service) {
        this.service = service;
    }

    @GetMapping
    public List<LeaveRequestResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) LeaveRequestType requestType,
            @RequestParam(required = false) LeaveRequestStatus status,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return service.search(keyword, requestType, null, status, employeeId, dateFrom, dateTo);
    }

    @GetMapping("/{id}")
    public LeaveRequestResponse get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<LeaveRequestResponse> create(@Valid @RequestBody LeaveRequestRequest req) {
        LeaveRequestResponse lr = service.create(req);
        return ResponseEntity.created(URI.create("/api/hr/leave-requests/" + lr.id())).body(lr);
    }

    @PutMapping("/{id}")
    public LeaveRequestResponse update(@PathVariable Long id, @Valid @RequestBody LeaveRequestRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
