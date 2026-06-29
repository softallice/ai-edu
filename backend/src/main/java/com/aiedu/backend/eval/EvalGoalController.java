package com.aiedu.backend.eval;

import com.aiedu.backend.eval.dto.EvalGoalRequest;
import com.aiedu.backend.eval.dto.EvalGoalResponse;
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

/** 업적목표 REST API. 06.평가 / 업적목표등록 화면에서 사용. */
@RestController
@RequestMapping("/api/eval/goals")
public class EvalGoalController {

    private final EvalGoalService service;

    public EvalGoalController(EvalGoalService service) {
        this.service = service;
    }

    @GetMapping
    public List<EvalGoalResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) EvalGoalStatus status,
            @RequestParam(required = false) String period) {
        return service.search(keyword, employeeId, status, period);
    }

    @GetMapping("/{id}")
    public EvalGoalResponse get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<EvalGoalResponse> create(@Valid @RequestBody EvalGoalRequest req) {
        EvalGoalResponse c = service.create(req);
        return ResponseEntity.created(URI.create("/api/eval/goals/" + c.id())).body(c);
    }

    @PutMapping("/{id}")
    public EvalGoalResponse update(@PathVariable Long id, @Valid @RequestBody EvalGoalRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
