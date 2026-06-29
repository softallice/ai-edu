package com.aiedu.backend.hr;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.hr.dto.EmployeeRequest;
import com.aiedu.backend.hr.dto.EmployeeResponse;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class EmployeeService {

    private final EmployeeRepository repository;
    private final DepartmentRepository departmentRepository;

    public EmployeeService(EmployeeRepository repository, DepartmentRepository departmentRepository) {
        this.repository = repository;
        this.departmentRepository = departmentRepository;
    }

    public List<EmployeeResponse> search(String keyword, Long departmentId, Boolean active) {
        Specification<Employee> spec = Specification.allOf(
                EmployeeSpecifications.keyword(keyword),
                EmployeeSpecifications.departmentEquals(departmentId),
                EmployeeSpecifications.activeEquals(active));
        return repository.findAll(spec, Sort.by("employeeNo")).stream().map(EmployeeResponse::from).toList();
    }

    public EmployeeResponse findById(Long id) {
        return EmployeeResponse.from(getOrThrow(id));
    }

    @Transactional
    public EmployeeResponse create(EmployeeRequest req) {
        if (repository.existsByEmployeeNo(req.employeeNo())) {
            throw new IllegalArgumentException("이미 존재하는 사번입니다: " + req.employeeNo());
        }
        Employee e = Employee.create(req.employeeNo(), req.name(), req.activeFlag(), resolveDept(req.departmentId()),
                req.position(), req.employmentType(), req.hireDate(), req.departureDate(), req.costRateOrZero(),
                req.workEmail(), req.workPhone(), req.mobile(), req.gender(), req.birthday());
        return EmployeeResponse.from(repository.save(e));
    }

    @Transactional
    public EmployeeResponse update(Long id, EmployeeRequest req) {
        Employee e = getOrThrow(id);
        if (repository.existsByEmployeeNoAndIdNot(req.employeeNo(), id)) {
            throw new IllegalArgumentException("이미 존재하는 사번입니다: " + req.employeeNo());
        }
        e.update(req.employeeNo(), req.name(), req.activeFlag(), resolveDept(req.departmentId()), req.position(),
                req.employmentType(), req.hireDate(), req.departureDate(), req.costRateOrZero(),
                req.workEmail(), req.workPhone(), req.mobile(), req.gender(), req.birthday());
        return EmployeeResponse.from(e);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private Department resolveDept(Long departmentId) {
        if (departmentId == null) return null;
        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("부서를 찾을 수 없습니다. id=" + departmentId));
    }

    private Employee getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("직원을 찾을 수 없습니다. id=" + id));
    }
}
