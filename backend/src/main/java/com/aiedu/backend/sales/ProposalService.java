package com.aiedu.backend.sales;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.customer.Customer;
import com.aiedu.backend.customer.CustomerRepository;
import com.aiedu.backend.pm.Project;
import com.aiedu.backend.pm.ProjectRepository;
import com.aiedu.backend.sales.dto.ProposalRequest;
import com.aiedu.backend.sales.dto.ProposalResponse;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 제안내역 비즈니스 로직. */
@Service
@Transactional(readOnly = true)
public class ProposalService {

    private final ProposalRepository repository;
    private final CustomerRepository customerRepository;
    private final ProjectRepository projectRepository;

    public ProposalService(ProposalRepository repository, CustomerRepository customerRepository,
            ProjectRepository projectRepository) {
        this.repository = repository;
        this.customerRepository = customerRepository;
        this.projectRepository = projectRepository;
    }

    public List<ProposalResponse> search(String keyword, ProposalStatus status, Long customerId,
            LocalDate dateFrom, LocalDate dateTo) {
        Specification<Proposal> spec = Specification.allOf(
                ProposalSpecifications.keyword(keyword),
                ProposalSpecifications.statusEquals(status),
                ProposalSpecifications.customerEquals(customerId),
                ProposalSpecifications.dateFrom(dateFrom),
                ProposalSpecifications.dateTo(dateTo));
        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "proposalDate")).stream()
                .map(ProposalResponse::from).toList();
    }

    public ProposalResponse findById(Long id) {
        return ProposalResponse.from(getOrThrow(id));
    }

    @Transactional
    public ProposalResponse create(ProposalRequest req) {
        Proposal p = Proposal.create(generateCode(), resolveCustomer(req.customerId()),
                resolveProject(req.projectId()), req.proposalDate(),
                req.title(), req.amount(), req.status(), req.note());
        return ProposalResponse.from(repository.save(p));
    }

    @Transactional
    public ProposalResponse update(Long id, ProposalRequest req) {
        Proposal p = getOrThrow(id);
        p.update(resolveCustomer(req.customerId()), resolveProject(req.projectId()),
                req.proposalDate(), req.title(), req.amount(), req.status(), req.note());
        return ProposalResponse.from(p);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private String generateCode() {
        String prefix = "PP-" + Year.now().getValue() + "-";
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

    private Project resolveProject(Long projectId) {
        if (projectId == null) return null;
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다. id=" + projectId));
    }

    private Proposal getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("제안내역을 찾을 수 없습니다. id=" + id));
    }
}
