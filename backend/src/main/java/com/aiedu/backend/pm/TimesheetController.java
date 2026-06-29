package com.aiedu.backend.pm;

import com.aiedu.backend.pm.dto.TimesheetRequest;
import com.aiedu.backend.pm.dto.TimesheetResponse;
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

/** 활동시간 REST API. 활동시간등록(/pm/activity/register)·조회(/pm/activity/view) 화면에서 사용. */
@RestController
@RequestMapping("/api/pm/timesheets")
public class TimesheetController {

    private final TimesheetService service;

    public TimesheetController(TimesheetService service) {
        this.service = service;
    }

    @GetMapping
    public List<TimesheetResponse> list(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Boolean validated) {
        return service.search(employeeId, projectId, dateFrom, dateTo, validated);
    }

    @GetMapping("/{id}")
    public TimesheetResponse get(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public ResponseEntity<TimesheetResponse> create(@Valid @RequestBody TimesheetRequest req) {
        TimesheetResponse c = service.create(req);
        return ResponseEntity.created(URI.create("/api/pm/timesheets/" + c.id())).body(c);
    }

    @PutMapping("/{id}")
    public TimesheetResponse update(@PathVariable Long id, @Valid @RequestBody TimesheetRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
