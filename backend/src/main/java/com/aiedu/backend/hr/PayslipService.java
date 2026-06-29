package com.aiedu.backend.hr;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.hr.dto.PayslipRequest;
import com.aiedu.backend.hr.dto.PayslipResponse;
import java.math.BigDecimal;
import java.time.Year;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 급여명세 서비스. */
@Service
@Transactional(readOnly = true)
public class PayslipService {

    private final PayslipRepository repository;
    private final EmployeeRepository employeeRepository;

    public PayslipService(PayslipRepository repository, EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
    }

    /** 급여명세 목록 조회. 키워드·상태·직원·귀속월 범위 필터 지원. */
    public List<PayslipResponse> search(String keyword, PayslipStatus status,
            Long employeeId, String payMonthFrom, String payMonthTo) {
        Specification<Payslip> spec = Specification.allOf(
                PayslipSpecifications.keyword(keyword),
                PayslipSpecifications.statusEquals(status),
                PayslipSpecifications.employeeEquals(employeeId),
                PayslipSpecifications.payMonthFrom(payMonthFrom),
                PayslipSpecifications.payMonthTo(payMonthTo));
        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "payMonth")).stream()
                .map(PayslipResponse::from).toList();
    }

    /** ID로 단건 조회. */
    public PayslipResponse findById(Long id) {
        return PayslipResponse.from(getOrThrow(id));
    }

    /** 급여명세 등록. */
    @Transactional
    public PayslipResponse create(PayslipRequest req) {
        Payslip p = Payslip.create(
                generateCode(),
                resolveEmployee(req.employeeId()),
                req.payMonth(),
                nullToZero(req.baseSalary()),
                nullToZero(req.allowance()),
                nullToZero(req.bonus()),
                nullToZero(req.deduction()),
                req.status(),
                req.note());
        return PayslipResponse.from(repository.save(p));
    }

    /** 급여명세 수정. */
    @Transactional
    public PayslipResponse update(Long id, PayslipRequest req) {
        Payslip p = getOrThrow(id);
        p.update(
                resolveEmployee(req.employeeId()),
                req.payMonth(),
                nullToZero(req.baseSalary()),
                nullToZero(req.allowance()),
                nullToZero(req.bonus()),
                nullToZero(req.deduction()),
                req.status(),
                req.note());
        return PayslipResponse.from(p);
    }

    /** 급여명세 삭제. */
    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    /** 급여명세 코드 채번. prefix "PS-"+년도+"-". */
    private String generateCode() {
        String prefix = "PS-" + Year.now().getValue() + "-";
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

    private Payslip getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("급여명세를 찾을 수 없습니다. id=" + id));
    }

    private static BigDecimal nullToZero(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }
}
