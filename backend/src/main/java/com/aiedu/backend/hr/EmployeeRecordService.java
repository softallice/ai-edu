package com.aiedu.backend.hr;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.hr.dto.EmployeeRecordRequest;
import com.aiedu.backend.hr.dto.EmployeeRecordResponse;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 인적사항 서비스. */
@Service
@Transactional(readOnly = true)
public class EmployeeRecordService {

    private final EmployeeRecordRepository repository;
    private final EmployeeRepository employeeRepository;

    public EmployeeRecordService(EmployeeRecordRepository repository,
            EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
    }

    /** 인적사항 목록 조회. 키워드·유형·직원·기간 필터 지원. */
    public List<EmployeeRecordResponse> search(String keyword, EmployeeRecordType recordType,
            List<EmployeeRecordType> types, Long employeeId,
            LocalDate dateFrom, LocalDate dateTo) {
        Specification<EmployeeRecord> spec = Specification.allOf(
                EmployeeRecordSpecifications.keyword(keyword),
                EmployeeRecordSpecifications.typeEquals(recordType),
                EmployeeRecordSpecifications.typeIn(types),
                EmployeeRecordSpecifications.employeeEquals(employeeId),
                EmployeeRecordSpecifications.dateFrom(dateFrom),
                EmployeeRecordSpecifications.dateTo(dateTo));
        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "startDate")).stream()
                .map(EmployeeRecordResponse::from).toList();
    }

    /** ID로 단건 조회. */
    public EmployeeRecordResponse findById(Long id) {
        return EmployeeRecordResponse.from(getOrThrow(id));
    }

    /** 인적사항 등록. */
    @Transactional
    public EmployeeRecordResponse create(EmployeeRecordRequest req) {
        EmployeeRecord er = EmployeeRecord.create(
                generateCode(),
                resolveEmployee(req.employeeId()),
                req.recordType(),
                req.title(),
                req.organization(),
                req.startDate(),
                req.endDate(),
                req.description(),
                req.note());
        return EmployeeRecordResponse.from(repository.save(er));
    }

    /** 인적사항 수정. */
    @Transactional
    public EmployeeRecordResponse update(Long id, EmployeeRecordRequest req) {
        EmployeeRecord er = getOrThrow(id);
        er.update(
                resolveEmployee(req.employeeId()),
                req.recordType(),
                req.title(),
                req.organization(),
                req.startDate(),
                req.endDate(),
                req.description(),
                req.note());
        return EmployeeRecordResponse.from(er);
    }

    /** 인적사항 삭제. */
    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    /** 인적사항 코드 채번. prefix "ER-"+년도+"-". */
    private String generateCode() {
        String prefix = "ER-" + Year.now().getValue() + "-";
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
                .orElseThrow(() -> new ResourceNotFoundException(
                        "직원을 찾을 수 없습니다. id=" + employeeId));
    }

    private EmployeeRecord getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "인적사항을 찾을 수 없습니다. id=" + id));
    }
}
