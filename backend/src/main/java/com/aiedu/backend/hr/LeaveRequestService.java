package com.aiedu.backend.hr;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.hr.dto.LeaveRequestRequest;
import com.aiedu.backend.hr.dto.LeaveRequestResponse;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 휴가/근로신청 서비스. */
@Service
@Transactional(readOnly = true)
public class LeaveRequestService {

    private final LeaveRequestRepository repository;
    private final EmployeeRepository employeeRepository;

    public LeaveRequestService(LeaveRequestRepository repository, EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
    }

    /** 휴가/근로신청 목록 조회. 키워드·유형·상태·직원·기간 필터 지원. */
    public List<LeaveRequestResponse> search(String keyword, LeaveRequestType requestType,
            List<LeaveRequestType> types, LeaveRequestStatus status,
            Long employeeId, LocalDate dateFrom, LocalDate dateTo) {
        Specification<LeaveRequest> spec = Specification.allOf(
                LeaveRequestSpecifications.keyword(keyword),
                LeaveRequestSpecifications.typeEquals(requestType),
                LeaveRequestSpecifications.typeIn(types),
                LeaveRequestSpecifications.statusEquals(status),
                LeaveRequestSpecifications.employeeEquals(employeeId),
                LeaveRequestSpecifications.dateFrom(dateFrom),
                LeaveRequestSpecifications.dateTo(dateTo));
        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "startDate")).stream()
                .map(LeaveRequestResponse::from).toList();
    }

    /** ID로 단건 조회. */
    public LeaveRequestResponse findById(Long id) {
        return LeaveRequestResponse.from(getOrThrow(id));
    }

    /** 휴가/근로신청 등록. */
    @Transactional
    public LeaveRequestResponse create(LeaveRequestRequest req) {
        LeaveRequest lr = LeaveRequest.create(
                generateCode(),
                resolveEmployee(req.employeeId()),
                req.requestType(),
                req.startDate(),
                req.endDate(),
                req.days(),
                req.hours(),
                req.reason(),
                req.status(),
                req.note());
        return LeaveRequestResponse.from(repository.save(lr));
    }

    /** 휴가/근로신청 수정. */
    @Transactional
    public LeaveRequestResponse update(Long id, LeaveRequestRequest req) {
        LeaveRequest lr = getOrThrow(id);
        lr.update(
                resolveEmployee(req.employeeId()),
                req.requestType(),
                req.startDate(),
                req.endDate(),
                req.days(),
                req.hours(),
                req.reason(),
                req.status(),
                req.note());
        return LeaveRequestResponse.from(lr);
    }

    /** 휴가/근로신청 삭제. */
    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    /** 신청 코드 채번. prefix "LR-"+년도+"-". */
    private String generateCode() {
        String prefix = "LR-" + Year.now().getValue() + "-";
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

    private LeaveRequest getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("휴가/근로신청을 찾을 수 없습니다. id=" + id));
    }
}
