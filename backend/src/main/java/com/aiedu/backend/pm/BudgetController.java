package com.aiedu.backend.pm;

import com.aiedu.backend.pm.dto.BudgetRequest;
import com.aiedu.backend.pm.dto.BudgetResponse;
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

/** 예산대실적 REST API. 01.프로젝트관리 / 예산관리 화면에서 사용. */
@RestController
@RequestMapping("/api/pm/budgets")
public class BudgetController {

    private final BudgetService service;

    public BudgetController(BudgetService service) {
        this.service = service;
    }

    @GetMapping
    public List<BudgetResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BudgetType budgetType,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Integer fiscalYear) {
        return service.search(keyword, budgetType, departmentId, projectId, fiscalYear);
    }

    @GetMapping("/{id}")
    public BudgetResponse get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> create(@Valid @RequestBody BudgetRequest req) {
        BudgetResponse c = service.create(req);
        return ResponseEntity.created(URI.create("/api/pm/budgets/" + c.id())).body(c);
    }

    @PutMapping("/{id}")
    public BudgetResponse update(@PathVariable Long id, @Valid @RequestBody BudgetRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
