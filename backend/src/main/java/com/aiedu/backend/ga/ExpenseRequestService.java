package com.aiedu.backend.ga;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.ga.dto.ExpenseRequestRequest;
import com.aiedu.backend.ga.dto.ExpenseRequestResponse;
import com.aiedu.backend.hr.Employee;
import com.aiedu.backend.hr.EmployeeRepository;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 지출품의 서비스. */
@Service
@Transactional(readOnly = true)
public class ExpenseRequestService {

    private final ExpenseRequestRepository repository;
    private final EmployeeRepository employeeRepository;

    public ExpenseRequestService(ExpenseRequestRepository repository,
            EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
    }

    /** 검색 조건에 맞는 지출품의 목록을 반환합니다. */
    public List<ExpenseRequestResponse> search(String keyword, Long employeeId,
            ExpenseType expenseType, ExpenseStatus status,
            LocalDate dateFrom, LocalDate dateTo) {
        Specification<ExpenseRequest> spec = Specification.allOf(
                ExpenseRequestSpecifications.keyword(keyword),
                ExpenseRequestSpecifications.employeeEquals(employeeId),
                ExpenseRequestSpecifications.typeEquals(expenseType),
                ExpenseRequestSpecifications.statusEquals(status),
                ExpenseRequestSpecifications.dateFrom(dateFrom),
                ExpenseRequestSpecifications.dateTo(dateTo));
        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "requestDate")).stream()
                .map(ExpenseRequestResponse::from).toList();
    }

    /** ID로 단건 조회합니다. */
    public ExpenseRequestResponse findById(Long id) {
        return ExpenseRequestResponse.from(getOrThrow(id));
    }

    /** 지출품의를 등록합니다. */
    @Transactional
    public ExpenseRequestResponse create(ExpenseRequestRequest req) {
        ExpenseRequest e = ExpenseRequest.create(
                generateCode(),
                resolveEmployee(req.employeeId()),
                req.expenseType(),
                req.title(),
                req.amount(),
                req.requestDate(),
                req.reason(),
                req.status());
        return ExpenseRequestResponse.from(repository.save(e));
    }

    /** 지출품의를 수정합니다. */
    @Transactional
    public ExpenseRequestResponse update(Long id, ExpenseRequestRequest req) {
        ExpenseRequest e = getOrThrow(id);
        e.update(resolveEmployee(req.employeeId()), req.expenseType(), req.title(),
                req.amount(), req.requestDate(), req.reason(), req.status());
        return ExpenseRequestResponse.from(e);
    }

    /** 지출품의를 삭제합니다. */
    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    /** 품의 번호 채번. prefix = "EX-"+년도+"-", 4자리 일련번호. */
    private String generateCode() {
        String prefix = "EX-" + Year.now().getValue() + "-";
        long seq = repository.count() + 1;
        String code = prefix + String.format("%04d", seq);
        while (repository.existsByCode(code)) {
            seq++;
            code = prefix + String.format("%04d", seq);
        }
        return code;
    }

    private Employee resolveEmployee(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("직원을 찾을 수 없습니다. id=" + employeeId));
    }

    private ExpenseRequest getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("지출품의를 찾을 수 없습니다. id=" + id));
    }
}
