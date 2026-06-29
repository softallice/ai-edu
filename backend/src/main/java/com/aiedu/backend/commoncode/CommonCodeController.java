package com.aiedu.backend.commoncode;

import com.aiedu.backend.commoncode.dto.CommonCodeRequest;
import com.aiedu.backend.commoncode.dto.CommonCodeResponse;
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

/** 공통코드 REST API. 08.공통 / 공통코드관리 화면에서 사용. */
@RestController
@RequestMapping("/api/common/codes")
public class CommonCodeController {

    private final CommonCodeService service;

    public CommonCodeController(CommonCodeService service) {
        this.service = service;
    }

    @GetMapping
    public List<CommonCodeResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String codeGroup,
            @RequestParam(required = false) Boolean useYn) {
        return service.search(keyword, codeGroup, useYn);
    }

    @GetMapping("/{id}")
    public CommonCodeResponse get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<CommonCodeResponse> create(@Valid @RequestBody CommonCodeRequest req) {
        CommonCodeResponse created = service.create(req);
        return ResponseEntity.created(URI.create("/api/common/codes/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    public CommonCodeResponse update(@PathVariable Long id,
            @Valid @RequestBody CommonCodeRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
