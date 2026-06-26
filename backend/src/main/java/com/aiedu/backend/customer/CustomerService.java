package com.aiedu.backend.customer;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.customer.dto.CustomerContactRequest;
import com.aiedu.backend.customer.dto.CustomerRequest;
import com.aiedu.backend.customer.dto.CustomerResponse;
import com.aiedu.backend.customer.dto.CustomerSummaryResponse;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 거래처 비즈니스 로직.
 *
 * <p>레거시 POVM0001Service(Map 기반, 트랜잭션 불명확)를 모던화: 생성자 주입, 서비스 계층
 * 트랜잭션 경계, 조회는 {@code readOnly}. 레거시 SAVE00 의 "insert/update 분기 + 담당자
 * 등록·수정·삭제"는 JPA 변경 감지(dirty checking) + cascade/orphanRemoval 로 단순화했습니다.
 */
@Service
@Transactional(readOnly = true)
public class CustomerService {

    private static final String CODE_FORMAT = "%06d";

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    /** 거래처 목록 조회(선택 필터: 키워드/사용여부/매입매출구분). 레거시 SEARCH00. */
    public List<CustomerSummaryResponse> search(String keyword, Boolean active, TradeType tradeType) {
        Specification<Customer> spec = Specification.allOf(
                CustomerSpecifications.keywordContains(keyword),
                CustomerSpecifications.activeEquals(active),
                CustomerSpecifications.tradeTypeEquals(tradeType));
        return customerRepository.findAll(spec, Sort.by("code")).stream()
                .map(CustomerSummaryResponse::from)
                .toList();
    }

    /** 거래처 단건(담당자 포함) 조회. 레거시 SEARCH01. */
    public CustomerResponse findById(Long id) {
        return CustomerResponse.from(getOrThrow(id));
    }

    /** 사업자번호 중복 여부. 레거시 SEARCH03. */
    public boolean isBusinessRegNoDuplicated(String businessRegNo, Long excludeId) {
        if (excludeId == null) {
            return customerRepository.existsByBusinessRegNo(businessRegNo);
        }
        return customerRepository.existsByBusinessRegNoAndIdNot(businessRegNo, excludeId);
    }

    /** 거래처 + 담당자 생성. 레거시 SAVE00(INSERT00/INSERT01). */
    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        if (customerRepository.existsByBusinessRegNo(request.businessRegNo())) {
            throw new DuplicateBusinessRegNoException(request.businessRegNo());
        }
        Customer customer = Customer.create(
                nextCode(),
                request.businessRegNo(), request.name(), request.shortName(), request.tradeType(),
                request.representativeName(), request.corporateRegNo(), request.businessCondition(),
                request.businessItem(), request.postNo(), request.address1(), request.address2(),
                request.telNo(), request.faxNo(), request.email(), request.taxType(),
                request.foundDate(), request.tradeStartDate(), request.tradeEndDate(),
                request.activeFlag(), request.electronicContractFlag());
        applyContacts(customer, request.contacts());
        return CustomerResponse.from(customerRepository.save(customer));
    }

    /** 거래처 + 담당자 수정. 레거시 SAVE00(UPDATE00 + 담당자 동기화). */
    @Transactional
    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = getOrThrow(id);
        if (customerRepository.existsByBusinessRegNoAndIdNot(request.businessRegNo(), id)) {
            throw new DuplicateBusinessRegNoException(request.businessRegNo());
        }
        customer.update(
                request.businessRegNo(), request.name(), request.shortName(), request.tradeType(),
                request.representativeName(), request.corporateRegNo(), request.businessCondition(),
                request.businessItem(), request.postNo(), request.address1(), request.address2(),
                request.telNo(), request.faxNo(), request.email(), request.taxType(),
                request.foundDate(), request.tradeStartDate(), request.tradeEndDate(),
                request.activeFlag(), request.electronicContractFlag());
        applyContacts(customer, request.contacts());
        // 변경 감지(dirty checking)로도 반영되지만, create 와의 일관성을 위해 명시적으로 저장합니다.
        return CustomerResponse.from(customerRepository.save(customer));
    }

    /** 거래처 삭제(담당자는 cascade 로 함께 삭제). 레거시 DELETE00/DELETE01. */
    @Transactional
    public void delete(Long id) {
        customerRepository.delete(getOrThrow(id));
    }

    private void applyContacts(Customer customer, List<CustomerContactRequest> contactRequests) {
        List<CustomerContact> contacts = contactRequests.stream()
                .map(c -> CustomerContact.create(c.department(), c.name(), c.telNo(), c.email()))
                .toList();
        customer.replaceContacts(contacts);
    }

    /**
     * 채번: 현재 최대 코드 + 1 을 6자리 0-패딩. 레거시 INSERT00 selectKey 대응.
     *
     * <p>교육용 단순 구현입니다. 동시 생성 시 같은 코드를 채번할 수 있으나, code 컬럼의 UNIQUE 제약과
     * 전역 예외 처리기의 무결성 위반 → 409 매핑이 안전망 역할을 합니다. 운영에서는 DB 시퀀스를 권장합니다.
     */
    private String nextCode() {
        long current = customerRepository.findMaxCode()
                .map(Long::parseLong)
                .orElse(0L);
        return String.format(CODE_FORMAT, current + 1);
    }

    private Customer getOrThrow(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("거래처를 찾을 수 없습니다. id=" + id));
    }
}
