package com.aiedu.backend.hr;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.hr.dto.AttendanceRequest;
import com.aiedu.backend.hr.dto.AttendanceResponse;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 근태/출퇴근부 서비스. */
@Service
@Transactional(readOnly = true)
public class AttendanceService {

    private final AttendanceRepository repository;
    private final EmployeeRepository employeeRepository;

    public AttendanceService(AttendanceRepository repository, EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
    }

    /** 근태 목록 조회. 직원·상태·기간 필터 지원. */
    public List<AttendanceResponse> search(Long employeeId, AttendanceStatus status,
            LocalDate dateFrom, LocalDate dateTo) {
        Specification<Attendance> spec = Specification.allOf(
                AttendanceSpecifications.employeeEquals(employeeId),
                AttendanceSpecifications.statusEquals(status),
                AttendanceSpecifications.dateFrom(dateFrom),
                AttendanceSpecifications.dateTo(dateTo));
        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "workDate")).stream()
                .map(AttendanceResponse::from).toList();
    }

    /** ID로 단건 조회. */
    public AttendanceResponse findById(Long id) {
        return AttendanceResponse.from(getOrThrow(id));
    }

    /** 근태 등록. */
    @Transactional
    public AttendanceResponse create(AttendanceRequest req) {
        Attendance a = Attendance.create(
                generateCode(),
                resolveEmployee(req.employeeId()),
                req.workDate(),
                req.checkIn(),
                req.checkOut(),
                req.workHours(),
                req.status(),
                req.note());
        return AttendanceResponse.from(repository.save(a));
    }

    /** 근태 수정. */
    @Transactional
    public AttendanceResponse update(Long id, AttendanceRequest req) {
        Attendance a = getOrThrow(id);
        a.update(
                resolveEmployee(req.employeeId()),
                req.workDate(),
                req.checkIn(),
                req.checkOut(),
                req.workHours(),
                req.status(),
                req.note());
        return AttendanceResponse.from(a);
    }

    /** 근태 삭제. */
    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    /** 근태 코드 채번. prefix "AT-"+년도+"-". */
    private String generateCode() {
        String prefix = "AT-" + Year.now().getValue() + "-";
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

    private Attendance getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("근태 기록을 찾을 수 없습니다. id=" + id));
    }
}
