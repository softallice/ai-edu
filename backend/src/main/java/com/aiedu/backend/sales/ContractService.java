package com.aiedu.backend.sales;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.customer.Customer;
import com.aiedu.backend.customer.CustomerRepository;
import com.aiedu.backend.hr.Employee;
import com.aiedu.backend.hr.EmployeeRepository;
import com.aiedu.backend.pm.Project;
import com.aiedu.backend.pm.ProjectRepository;
import com.aiedu.backend.sales.dto.ContractLineRequest;
import com.aiedu.backend.sales.dto.ContractLineRowResponse;
import com.aiedu.backend.sales.dto.ContractRequest;
import com.aiedu.backend.sales.dto.ContractResponse;
import com.aiedu.backend.sales.dto.ContractSummaryResponse;
import java.time.Year;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ContractService {

    private final ContractRepository repository;
    private final CustomerRepository customerRepository;
    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;

    public ContractService(ContractRepository repository, CustomerRepository customerRepository,
            ProjectRepository projectRepository, EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.customerRepository = customerRepository;
        this.projectRepository = projectRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<ContractSummaryResponse> search(String keyword, ContractState state, Long customerId, Boolean active) {
        return repository.findAll(filter(keyword, state, customerId, active), Sort.by("code")).stream()
                .map(ContractSummaryResponse::from).toList();
    }

    /** 계약품목현황: 조건에 맞는 계약들의 품목을 평탄화해 반환. */
    public List<ContractLineRowResponse> searchLines(String keyword, ContractState state, Long customerId) {
        return repository.findAll(filter(keyword, state, customerId, null), Sort.by("code")).stream()
                .flatMap(c -> c.getLines().stream().map(l -> ContractLineRowResponse.from(c, l)))
                .toList();
    }

    public ContractResponse findById(Long id) {
        return ContractResponse.from(getOrThrow(id));
    }

    @Transactional
    public ContractResponse create(ContractRequest req) {
        Contract c = Contract.create(generateCode(), req.name(), resolveCustomer(req.customerId()),
                resolveProject(req.projectId()), resolveOwner(req.ownerId()), req.state(),
                req.contractDate(), req.startDate(), req.endDate(), req.currencyOrDefault(), req.note(),
                req.activeFlag());
        applyLines(c, req.linesOrEmpty());
        return ContractResponse.from(repository.save(c));
    }

    @Transactional
    public ContractResponse update(Long id, ContractRequest req) {
        Contract c = getOrThrow(id);
        c.update(req.name(), resolveCustomer(req.customerId()), resolveProject(req.projectId()),
                resolveOwner(req.ownerId()), req.state(), req.contractDate(), req.startDate(), req.endDate(),
                req.currencyOrDefault(), req.note(), req.activeFlag());
        applyLines(c, req.linesOrEmpty());
        return ContractResponse.from(repository.save(c));
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private void applyLines(Contract c, List<ContractLineRequest> reqs) {
        c.replaceLines(reqs.stream()
                .map(l -> ContractLine.create(l.itemName(), l.spec(), l.quantityOrOne(), l.unitPriceOrZero(),
                        l.remark()))
                .toList());
    }

    private Specification<Contract> filter(String keyword, ContractState state, Long customerId, Boolean active) {
        return Specification.allOf(
                ContractSpecifications.keyword(keyword),
                ContractSpecifications.stateEquals(state),
                ContractSpecifications.customerEquals(customerId),
                ContractSpecifications.activeEquals(active));
    }

    private String generateCode() {
        String prefix = "CT-" + Year.now().getValue() + "-";
        long seq = repository.count() + 1;
        String code = prefix + String.format("%03d", seq);
        while (repository.existsByCode(code)) {
            seq++;
            code = prefix + String.format("%03d", seq);
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

    private Employee resolveOwner(Long ownerId) {
        if (ownerId == null) return null;
        return employeeRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("직원을 찾을 수 없습니다. id=" + ownerId));
    }

    private Contract getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("계약을 찾을 수 없습니다. id=" + id));
    }
}
