package com.aiedu.backend.eval;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.eval.dto.AppraisalRequest;
import com.aiedu.backend.eval.dto.AppraisalResponse;
import com.aiedu.backend.hr.Employee;
import com.aiedu.backend.hr.EmployeeRepository;
import java.time.Year;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 업적평가 서비스. */
@Service
@Transactional(readOnly = true)
public class AppraisalService {

    private final AppraisalRepository repository;
    private final EmployeeRepository employeeRepository;
    private final EvalGoalRepository evalGoalRepository;

    public AppraisalService(AppraisalRepository repository,
            EmployeeRepository employeeRepository,
            EvalGoalRepository evalGoalRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
        this.evalGoalRepository = evalGoalRepository;
    }

    public List<AppraisalResponse> search(String keyword, AppraisalStatus status,
            Long employeeId, String period) {
        Specification<Appraisal> spec = Specification.allOf(
                AppraisalSpecifications.keyword(keyword),
                AppraisalSpecifications.statusEquals(status),
                AppraisalSpecifications.employeeEquals(employeeId),
                AppraisalSpecifications.periodEquals(period));
        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "code")).stream()
                .map(AppraisalResponse::from).toList();
    }

    public AppraisalResponse findById(Long id) {
        return AppraisalResponse.from(getOrThrow(id));
    }

    @Transactional
    public AppraisalResponse create(AppraisalRequest req) {
        Appraisal a = Appraisal.create(
                generateCode(),
                resolveEmployee(req.employeeId()),
                resolveEvalGoal(req.evalGoalId()),
                req.period(),
                req.selfScore(), req.firstScore(), req.secondScore(),
                req.grade(), req.status(), req.comment());
        return AppraisalResponse.from(repository.save(a));
    }

    @Transactional
    public AppraisalResponse update(Long id, AppraisalRequest req) {
        Appraisal a = getOrThrow(id);
        a.update(resolveEmployee(req.employeeId()),
                resolveEvalGoal(req.evalGoalId()),
                req.period(),
                req.selfScore(), req.firstScore(), req.secondScore(),
                req.grade(), req.status(), req.comment());
        return AppraisalResponse.from(a);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private String generateCode() {
        String prefix = "AP-" + Year.now().getValue() + "-";
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

    private EvalGoal resolveEvalGoal(Long evalGoalId) {
        if (evalGoalId == null) return null;
        return evalGoalRepository.findById(evalGoalId)
                .orElseThrow(() -> new ResourceNotFoundException("업적목표를 찾을 수 없습니다. id=" + evalGoalId));
    }

    private Appraisal getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("업적평가를 찾을 수 없습니다. id=" + id));
    }
}
