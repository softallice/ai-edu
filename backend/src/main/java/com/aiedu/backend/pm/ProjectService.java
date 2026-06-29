package com.aiedu.backend.pm;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.customer.Customer;
import com.aiedu.backend.customer.CustomerRepository;
import com.aiedu.backend.hr.Employee;
import com.aiedu.backend.hr.EmployeeRepository;
import com.aiedu.backend.pm.dto.ProjectRequest;
import com.aiedu.backend.pm.dto.ProjectResponse;
import java.time.Year;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository repository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;

    public ProjectService(ProjectRepository repository, CustomerRepository customerRepository,
            EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.customerRepository = customerRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<ProjectResponse> search(String keyword, ProjectStatus status, Boolean active) {
        Specification<Project> spec = Specification.allOf(keywordSpec(keyword), statusSpec(status), activeSpec(active));
        return repository.findAll(spec, Sort.by("code")).stream().map(ProjectResponse::from).toList();
    }

    public ProjectResponse findById(Long id) {
        return ProjectResponse.from(getOrThrow(id));
    }

    @Transactional
    public ProjectResponse create(ProjectRequest req) {
        Project p = Project.create(generateCode(), req.name(), resolveCustomer(req.customerId()),
                resolveEmployee(req.managerId()), req.status(), req.dateStart(), req.dateEnd(), req.activeFlag());
        return ProjectResponse.from(repository.save(p));
    }

    @Transactional
    public ProjectResponse update(Long id, ProjectRequest req) {
        Project p = getOrThrow(id);
        p.update(req.name(), resolveCustomer(req.customerId()), resolveEmployee(req.managerId()),
                req.status(), req.dateStart(), req.dateEnd(), req.activeFlag());
        return ProjectResponse.from(p);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    /** "PRJ-{연도}-{3자리 일련}" 형식으로 채번합니다. */
    private String generateCode() {
        String prefix = "PRJ-" + Year.now().getValue() + "-";
        long seq = repository.count() + 1;
        String code = prefix + String.format("%03d", seq);
        while (repository.existsByCode(code)) {
            seq++;
            code = prefix + String.format("%03d", seq);
        }
        return code;
    }

    private Customer resolveCustomer(Long customerId) {
        if (customerId == null) return null;
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("거래처를 찾을 수 없습니다. id=" + customerId));
    }

    private Employee resolveEmployee(Long employeeId) {
        if (employeeId == null) return null;
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("직원을 찾을 수 없습니다. id=" + employeeId));
    }

    private Project getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다. id=" + id));
    }

    private static Specification<Project> keywordSpec(String kw) {
        return (root, q, cb) -> {
            if (kw == null || kw.isBlank()) return cb.conjunction();
            String like = "%" + kw.trim().toLowerCase() + "%";
            return cb.or(cb.like(cb.lower(root.get("name")), like), cb.like(cb.lower(root.get("code")), like));
        };
    }

    private static Specification<Project> statusSpec(ProjectStatus status) {
        return (root, q, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    private static Specification<Project> activeSpec(Boolean active) {
        return (root, q, cb) -> active == null ? cb.conjunction() : cb.equal(root.get("active"), active);
    }
}
