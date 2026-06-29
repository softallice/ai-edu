package com.aiedu.backend.eval;

import com.aiedu.backend.eval.dto.AppraisalRequest;
import com.aiedu.backend.eval.dto.AppraisalResponse;
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

/** 업적평가 REST API. 06.평가 / 본인평가·1차·2차 평가 화면에서 사용. */
@RestController
@RequestMapping("/api/eval/appraisals")
public class AppraisalController {

    private final AppraisalService service;

    public AppraisalController(AppraisalService service) {
        this.service = service;
    }

    @GetMapping
    public List<AppraisalResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) AppraisalStatus status,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String period) {
        return service.search(keyword, status, employeeId, period);
    }

    @GetMapping("/{id}")
    public AppraisalResponse get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<AppraisalResponse> create(@Valid @RequestBody AppraisalRequest req) {
        AppraisalResponse c = service.create(req);
        return ResponseEntity.created(URI.create("/api/eval/appraisals/" + c.id())).body(c);
    }

    @PutMapping("/{id}")
    public AppraisalResponse update(@PathVariable Long id, @Valid @RequestBody AppraisalRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
