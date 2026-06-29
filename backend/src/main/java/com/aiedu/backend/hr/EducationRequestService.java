package com.aiedu.backend.hr;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.hr.dto.EducationRequestRequest;
import com.aiedu.backend.hr.dto.EducationRequestResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 교육신청 서비스. */
@Service
@Transactional(readOnly = true)
public class EducationRequestService {

    private final EducationRequestRepository repository;
    private final EmployeeRepository employeeRepository;

    public EducationRequestService(EducationRequestRepository repository,
            EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
    }

    /** 교육신청 목록 조회. 키워드·유형·상태·직원·기간 필터 지원. */
    public List<EducationRequestResponse> search(String keyword, EducationType eduType,
            EducationStatus status, Long employeeId, LocalDate dateFrom, LocalDate dateTo) {
        Specification<EducationRequest> spec = Specification.allOf(
                EducationRequestSpecifications.keyword(keyword),
                EducationRequestSpecifications.eduTypeEquals(eduType),
                EducationRequestSpecifications.statusEquals(status),
                EducationRequestSpecifications.employeeEquals(employeeId),
                EducationRequestSpecifications.dateFrom(dateFrom),
                EducationRequestSpecifications.dateTo(dateTo));
        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "startDate")).stream()
                .map(EducationRequestResponse::from).toList();
    }

    /** ID로 단건 조회. */
    public EducationRequestResponse findById(Long id) {
        return EducationRequestResponse.from(getOrThrow(id));
    }

    /** 교육신청 등록. */
    @Transactional
    public EducationRequestResponse create(EducationRequestRequest req) {
        EducationRequest er = EducationRequest.create(
                generateCode(),
                resolveEmployee(req.employeeId()),
                req.eduType(),
                req.title(),
                req.institution(),
                req.startDate(),
                req.endDate(),
                req.cost() != null ? req.cost() : BigDecimal.ZERO,
                req.status(),
                req.result(),
                req.note());
        return EducationRequestResponse.from(repository.save(er));
    }

    /** 교육신청 수정. */
    @Transactional
    public EducationRequestResponse update(Long id, EducationRequestRequest req) {
        EducationRequest er = getOrThrow(id);
        er.update(
                resolveEmployee(req.employeeId()),
                req.eduType(),
                req.title(),
                req.institution(),
                req.startDate(),
                req.endDate(),
                req.cost() != null ? req.cost() : BigDecimal.ZERO,
                req.status(),
                req.result(),
                req.note());
        return EducationRequestResponse.from(er);
    }

    /** 교육신청 삭제. */
    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    /** 신청 코드 채번. prefix "ED-"+년도+"-". */
    private String generateCode() {
        String prefix = "ED-" + Year.now().getValue() + "-";
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

    private EducationRequest getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("교육신청을 찾을 수 없습니다. id=" + id));
    }
}
