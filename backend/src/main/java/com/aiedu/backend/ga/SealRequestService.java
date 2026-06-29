package com.aiedu.backend.ga;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.ga.dto.SealRequestRequest;
import com.aiedu.backend.ga.dto.SealRequestResponse;
import com.aiedu.backend.hr.Employee;
import com.aiedu.backend.hr.EmployeeRepository;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 인감신청 서비스. */
@Service
@Transactional(readOnly = true)
public class SealRequestService {

    private final SealRequestRepository repository;
    private final EmployeeRepository employeeRepository;

    public SealRequestService(SealRequestRepository repository,
            EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
    }

    /** 검색 조건에 맞는 인감신청 목록을 반환합니다. */
    public List<SealRequestResponse> search(String keyword, Long employeeId,
            SealType sealType, SealStatus status,
            LocalDate dateFrom, LocalDate dateTo) {
        Specification<SealRequest> spec = Specification.allOf(
                SealRequestSpecifications.keyword(keyword),
                SealRequestSpecifications.employeeEquals(employeeId),
                SealRequestSpecifications.typeEquals(sealType),
                SealRequestSpecifications.statusEquals(status),
                SealRequestSpecifications.dateFrom(dateFrom),
                SealRequestSpecifications.dateTo(dateTo));
        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "useDate")).stream()
                .map(SealRequestResponse::from).toList();
    }

    /** ID로 단건 조회합니다. */
    public SealRequestResponse findById(Long id) {
        return SealRequestResponse.from(getOrThrow(id));
    }

    /** 인감신청을 등록합니다. */
    @Transactional
    public SealRequestResponse create(SealRequestRequest req) {
        SealRequest e = SealRequest.create(
                generateCode(),
                resolveEmployee(req.employeeId()),
                req.sealType(),
                req.title(),
                req.purpose(),
                req.useDate(),
                req.status());
        return SealRequestResponse.from(repository.save(e));
    }

    /** 인감신청을 수정합니다. */
    @Transactional
    public SealRequestResponse update(Long id, SealRequestRequest req) {
        SealRequest e = getOrThrow(id);
        e.update(resolveEmployee(req.employeeId()), req.sealType(), req.title(),
                req.purpose(), req.useDate(), req.status());
        return SealRequestResponse.from(e);
    }

    /** 인감신청을 삭제합니다. */
    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    /** 신청 번호 채번. prefix = "SL-"+년도+"-", 4자리 일련번호. */
    private String generateCode() {
        String prefix = "SL-" + Year.now().getValue() + "-";
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

    private SealRequest getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("인감신청을 찾을 수 없습니다. id=" + id));
    }
}
