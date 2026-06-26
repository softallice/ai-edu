package com.aiedu.backend.customer;

import com.aiedu.backend.customer.dto.CustomerRequest;
import com.aiedu.backend.customer.dto.CustomerResponse;
import com.aiedu.backend.customer.dto.CustomerSummaryResponse;
import com.aiedu.backend.customer.dto.DuplicateCheckResponse;
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

/**
 * 거래처 REST API.
 *
 * <p>레거시 POVM0001Controller 의 {@code .do} 엔드포인트(SEARCH00/01/02, SAVE00, DELETE00)를
 * 자원 중심 REST URL 로 모던화했습니다. 컨트롤러는 얇게 유지하고 비즈니스 로직은 서비스에 둡니다.
 */
@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    /** 거래처 목록(요약). 레거시 POVM0001_SEARCH00.do */
    @GetMapping
    public List<CustomerSummaryResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) TradeType tradeType) {
        return customerService.search(keyword, active, tradeType);
    }

    /** 거래처 상세(담당자 포함). 레거시 POVM0001_SEARCH01.do */
    @GetMapping("/{id}")
    public CustomerResponse get(@PathVariable Long id) {
        return customerService.findById(id);
    }

    /** 사업자번호 중복 확인. 레거시 POVM0001_SEARCH02/03 */
    @GetMapping("/check-business-reg-no")
    public DuplicateCheckResponse checkBusinessRegNo(
            @RequestParam String businessRegNo,
            @RequestParam(required = false) Long excludeId) {
        return new DuplicateCheckResponse(
                customerService.isBusinessRegNoDuplicated(businessRegNo, excludeId));
    }

    /** 거래처 생성. 레거시 POVM0001_SAVE00.do (신규) */
    @PostMapping
    public ResponseEntity<CustomerResponse> create(@Valid @RequestBody CustomerRequest request) {
        CustomerResponse created = customerService.create(request);
        return ResponseEntity.created(URI.create("/api/customers/" + created.id())).body(created);
    }

    /** 거래처 수정. 레거시 POVM0001_SAVE00.do (수정) */
    @PutMapping("/{id}")
    public CustomerResponse update(@PathVariable Long id, @Valid @RequestBody CustomerRequest request) {
        return customerService.update(id, request);
    }

    /** 거래처 삭제. 레거시 POVM0001_DELETE00.do */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        customerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
