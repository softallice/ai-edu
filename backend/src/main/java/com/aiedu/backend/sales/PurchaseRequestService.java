package com.aiedu.backend.sales;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.hr.Employee;
import com.aiedu.backend.hr.EmployeeRepository;
import com.aiedu.backend.pm.Project;
import com.aiedu.backend.pm.ProjectRepository;
import com.aiedu.backend.sales.dto.PurchaseRequestRequest;
import com.aiedu.backend.sales.dto.PurchaseRequestResponse;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PurchaseRequestService {

    private final PurchaseRequestRepository repository;
    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;

    public PurchaseRequestService(PurchaseRequestRepository repository,
            ProjectRepository projectRepository, EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.projectRepository = projectRepository;
        this.employeeRepository = employeeRepository;
    }

    /** 구매의뢰 목록을 동적 조건으로 검색합니다. */
    public List<PurchaseRequestResponse> search(String keyword, PurchaseRequestStatus status,
            LocalDate dateFrom, LocalDate dateTo) {
        Specification<PurchaseRequest> spec = Specification.allOf(
                PurchaseRequestSpecifications.keyword(keyword),
                PurchaseRequestSpecifications.statusEquals(status),
                PurchaseRequestSpecifications.dateFrom(dateFrom),
                PurchaseRequestSpecifications.dateTo(dateTo));
        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "requestDate")).stream()
                .map(PurchaseRequestResponse::from).toList();
    }

    /** ID로 구매의뢰를 조회합니다. */
    public PurchaseRequestResponse findById(Long id) {
        return PurchaseRequestResponse.from(getOrThrow(id));
    }

    /** 구매의뢰를 생성합니다. */
    @Transactional
    public PurchaseRequestResponse create(PurchaseRequestRequest req) {
        PurchaseRequest pr = PurchaseRequest.create(
                generateCode(),
                resolveProject(req.projectId()),
                resolveRequester(req.requesterId()),
                req.requestDate(), req.itemName(), req.quantity(),
                req.estimatedAmount(), req.status(), req.note());
        return PurchaseRequestResponse.from(repository.save(pr));
    }

    /** 구매의뢰를 수정합니다. */
    @Transactional
    public PurchaseRequestResponse update(Long id, PurchaseRequestRequest req) {
        PurchaseRequest pr = getOrThrow(id);
        pr.update(resolveProject(req.projectId()), resolveRequester(req.requesterId()),
                req.requestDate(), req.itemName(), req.quantity(),
                req.estimatedAmount(), req.status(), req.note());
        return PurchaseRequestResponse.from(pr);
    }

    /** 구매의뢰를 삭제합니다. */
    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private String generateCode() {
        String prefix = "PR-" + Year.now().getValue() + "-";
        long seq = repository.count() + 1;
        String code = prefix + String.format("%04d", seq);
        while (repository.existsByCode(code)) {
            seq++;
            code = prefix + String.format("%04d", seq);
        }
        return code;
    }

    private Project resolveProject(Long projectId) {
        if (projectId == null) return null;
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다. id=" + projectId));
    }

    private Employee resolveRequester(Long requesterId) {
        if (requesterId == null) return null;
        return employeeRepository.findById(requesterId)
                .orElseThrow(() -> new ResourceNotFoundException("직원을 찾을 수 없습니다. id=" + requesterId));
    }

    private PurchaseRequest getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("구매의뢰를 찾을 수 없습니다. id=" + id));
    }
}
