package com.aiedu.backend.sales;

import com.aiedu.backend.sales.dto.ProjectCollectionRequest;
import com.aiedu.backend.sales.dto.ProjectCollectionResponse;
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

/** 프로젝트수금 REST API. 02.영업 / 수금 화면에서 사용. */
@RestController
@RequestMapping("/api/sales/collections")
public class ProjectCollectionController {

    private final ProjectCollectionService service;

    public ProjectCollectionController(ProjectCollectionService service) {
        this.service = service;
    }

    @GetMapping
    public List<ProjectCollectionResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) CollectionStatus status,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return service.search(keyword, status, customerId, dateFrom, dateTo);
    }

    @GetMapping("/{id}")
    public ProjectCollectionResponse get(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public ResponseEntity<ProjectCollectionResponse> create(@Valid @RequestBody ProjectCollectionRequest req) {
        ProjectCollectionResponse c = service.create(req);
        return ResponseEntity.created(URI.create("/api/sales/collections/" + c.id())).body(c);
    }

    @PutMapping("/{id}")
    public ProjectCollectionResponse update(@PathVariable Long id, @Valid @RequestBody ProjectCollectionRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
