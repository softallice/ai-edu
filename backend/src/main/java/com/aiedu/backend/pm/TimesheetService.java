package com.aiedu.backend.pm;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.hr.Employee;
import com.aiedu.backend.hr.EmployeeRepository;
import com.aiedu.backend.pm.dto.TimesheetRequest;
import com.aiedu.backend.pm.dto.TimesheetResponse;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class TimesheetService {

    private final TimesheetRepository repository;
    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;

    public TimesheetService(TimesheetRepository repository, ProjectRepository projectRepository,
            EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.projectRepository = projectRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<TimesheetResponse> search(Long employeeId, Long projectId, LocalDate dateFrom, LocalDate dateTo,
            Boolean validated) {
        Specification<Timesheet> spec = Specification.allOf(
                TimesheetSpecifications.employeeEquals(employeeId),
                TimesheetSpecifications.projectEquals(projectId),
                TimesheetSpecifications.dateFrom(dateFrom),
                TimesheetSpecifications.dateTo(dateTo),
                TimesheetSpecifications.validatedEquals(validated));
        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "workDate"))
                .stream().map(TimesheetResponse::from).toList();
    }

    public TimesheetResponse findById(Long id) {
        return TimesheetResponse.from(getOrThrow(id));
    }

    @Transactional
    public TimesheetResponse create(TimesheetRequest req) {
        Timesheet t = Timesheet.create(resolveEmployee(req.employeeId()), resolveProject(req.projectId()),
                req.workDate(), req.hours(), req.activityType(), req.description(), req.billableFlag());
        return TimesheetResponse.from(repository.save(t));
    }

    @Transactional
    public TimesheetResponse update(Long id, TimesheetRequest req) {
        Timesheet t = getOrThrow(id);
        if (t.isValidated()) {
            throw new IllegalArgumentException("이미 승인된 활동시간은 수정할 수 없습니다.");
        }
        t.update(resolveEmployee(req.employeeId()), resolveProject(req.projectId()),
                req.workDate(), req.hours(), req.activityType(), req.description(), req.billableFlag());
        return TimesheetResponse.from(t);
    }

    @Transactional
    public void delete(Long id) {
        Timesheet t = getOrThrow(id);
        if (t.isValidated()) {
            throw new IllegalArgumentException("이미 승인된 활동시간은 삭제할 수 없습니다.");
        }
        repository.delete(t);
    }

    private Project resolveProject(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다. id=" + projectId));
    }

    private Employee resolveEmployee(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("직원을 찾을 수 없습니다. id=" + employeeId));
    }

    private Timesheet getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("활동시간을 찾을 수 없습니다. id=" + id));
    }
}
