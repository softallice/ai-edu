package com.aiedu.backend.pm;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.hr.Department;
import com.aiedu.backend.hr.DepartmentRepository;
import com.aiedu.backend.pm.dto.BudgetRequest;
import com.aiedu.backend.pm.dto.BudgetResponse;
import java.time.Year;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 예산대실적 서비스. */
@Service
@Transactional(readOnly = true)
public class BudgetService {

    private final BudgetRepository repository;
    private final DepartmentRepository departmentRepository;
    private final ProjectRepository projectRepository;

    public BudgetService(BudgetRepository repository,
            DepartmentRepository departmentRepository,
            ProjectRepository projectRepository) {
        this.repository = repository;
        this.departmentRepository = departmentRepository;
        this.projectRepository = projectRepository;
    }

    /**
     * 예산 목록 검색.
     *
     * @param keyword      코드/예산항목 키워드
     * @param budgetType   예산 유형 필터
     * @param departmentId 부서 id 필터
     * @param projectId    프로젝트 id 필터
     * @param fiscalYear   회계연도 필터
     */
    public List<BudgetResponse> search(String keyword, BudgetType budgetType,
            Long departmentId, Long projectId, Integer fiscalYear) {
        Specification<Budget> spec = Specification.allOf(
                BudgetSpecifications.keyword(keyword),
                BudgetSpecifications.budgetTypeEquals(budgetType),
                BudgetSpecifications.departmentEquals(departmentId),
                BudgetSpecifications.projectEquals(projectId),
                BudgetSpecifications.fiscalYearEquals(fiscalYear));
        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "fiscalYear", "id"))
                .stream().map(BudgetResponse::from).toList();
    }

    /** id로 예산 단건 조회. */
    public BudgetResponse findById(Long id) {
        return BudgetResponse.from(getOrThrow(id));
    }

    /** 예산 등록. */
    @Transactional
    public BudgetResponse create(BudgetRequest req) {
        Budget b = Budget.create(
                generateCode(),
                req.budgetType(),
                resolveDepartment(req.departmentId()),
                resolveProject(req.projectId()),
                req.fiscalYear(),
                req.category(),
                req.plannedAmount(),
                req.actualAmount(),
                req.note());
        return BudgetResponse.from(repository.save(b));
    }

    /** 예산 수정. */
    @Transactional
    public BudgetResponse update(Long id, BudgetRequest req) {
        Budget b = getOrThrow(id);
        b.update(req.budgetType(),
                resolveDepartment(req.departmentId()),
                resolveProject(req.projectId()),
                req.fiscalYear(),
                req.category(),
                req.plannedAmount(),
                req.actualAmount(),
                req.note());
        return BudgetResponse.from(b);
    }

    /** 예산 삭제. */
    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private String generateCode() {
        String prefix = "BG-" + Year.now().getValue() + "-";
        long seq = repository.count() + 1;
        String code = prefix + String.format("%04d", seq);
        while (repository.existsByCode(code)) {
            seq++;
            code = prefix + String.format("%04d", seq);
        }
        return code;
    }

    private Department resolveDepartment(Long id) {
        if (id == null) return null;
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("부서를 찾을 수 없습니다. id=" + id));
    }

    private Project resolveProject(Long id) {
        if (id == null) return null;
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다. id=" + id));
    }

    private Budget getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("예산을 찾을 수 없습니다. id=" + id));
    }
}
