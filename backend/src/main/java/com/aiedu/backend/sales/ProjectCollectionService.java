package com.aiedu.backend.sales;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.customer.Customer;
import com.aiedu.backend.customer.CustomerRepository;
import com.aiedu.backend.pm.Project;
import com.aiedu.backend.pm.ProjectRepository;
import com.aiedu.backend.sales.dto.ProjectCollectionRequest;
import com.aiedu.backend.sales.dto.ProjectCollectionResponse;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProjectCollectionService {

    private final ProjectCollectionRepository repository;
    private final CustomerRepository customerRepository;
    private final ContractRepository contractRepository;
    private final ProjectRepository projectRepository;

    public ProjectCollectionService(ProjectCollectionRepository repository,
            CustomerRepository customerRepository,
            ContractRepository contractRepository,
            ProjectRepository projectRepository) {
        this.repository = repository;
        this.customerRepository = customerRepository;
        this.contractRepository = contractRepository;
        this.projectRepository = projectRepository;
    }

    public List<ProjectCollectionResponse> search(String keyword, CollectionStatus status,
            Long customerId, LocalDate dateFrom, LocalDate dateTo) {
        Specification<ProjectCollection> spec = Specification.allOf(
                ProjectCollectionSpecifications.keyword(keyword),
                ProjectCollectionSpecifications.statusEquals(status),
                ProjectCollectionSpecifications.customerEquals(customerId),
                ProjectCollectionSpecifications.dateFrom(dateFrom),
                ProjectCollectionSpecifications.dateTo(dateTo));
        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "plannedDate")).stream()
                .map(ProjectCollectionResponse::from).toList();
    }

    public ProjectCollectionResponse findById(Long id) {
        return ProjectCollectionResponse.from(getOrThrow(id));
    }

    @Transactional
    public ProjectCollectionResponse create(ProjectCollectionRequest req) {
        ProjectCollection e = ProjectCollection.create(
                generateCode(),
                resolveCustomer(req.customerId()),
                resolveContract(req.contractId()),
                resolveProject(req.projectId()),
                req.plannedDate(), req.collectDate(),
                req.amount(), req.method(), req.status(), req.note());
        return ProjectCollectionResponse.from(repository.save(e));
    }

    @Transactional
    public ProjectCollectionResponse update(Long id, ProjectCollectionRequest req) {
        ProjectCollection e = getOrThrow(id);
        e.update(resolveCustomer(req.customerId()),
                resolveContract(req.contractId()),
                resolveProject(req.projectId()),
                req.plannedDate(), req.collectDate(),
                req.amount(), req.method(), req.status(), req.note());
        return ProjectCollectionResponse.from(e);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private String generateCode() {
        String prefix = "RC-" + Year.now().getValue() + "-";
        long seq = repository.count() + 1;
        String code = prefix + String.format("%04d", seq);
        while (repository.existsByCode(code)) {
            seq++;
            code = prefix + String.format("%04d", seq);
        }
        return code;
    }

    private Customer resolveCustomer(Long customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("거래처를 찾을 수 없습니다. id=" + customerId));
    }

    private Contract resolveContract(Long contractId) {
        if (contractId == null) return null;
        return contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("계약을 찾을 수 없습니다. id=" + contractId));
    }

    private Project resolveProject(Long projectId) {
        if (projectId == null) return null;
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다. id=" + projectId));
    }

    private ProjectCollection getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("수금 레코드를 찾을 수 없습니다. id=" + id));
    }
}
