package com.aiedu.backend.eval;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.eval.dto.EvalGoalRequest;
import com.aiedu.backend.eval.dto.EvalGoalResponse;
import com.aiedu.backend.hr.Employee;
import com.aiedu.backend.hr.EmployeeRepository;
import java.time.Year;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 업적목표 서비스. */
@Service
@Transactional(readOnly = true)
public class EvalGoalService {

    private final EvalGoalRepository repository;
    private final EmployeeRepository employeeRepository;

    public EvalGoalService(EvalGoalRepository repository, EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
    }

    public List<EvalGoalResponse> search(String keyword, Long employeeId,
            EvalGoalStatus status, String period) {
        Specification<EvalGoal> spec = Specification.allOf(
                EvalGoalSpecifications.keyword(keyword),
                EvalGoalSpecifications.employeeEquals(employeeId),
                EvalGoalSpecifications.statusEquals(status),
                EvalGoalSpecifications.periodEquals(period));
        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "id")).stream()
                .map(EvalGoalResponse::from).toList();
    }

    public EvalGoalResponse findById(Long id) {
        return EvalGoalResponse.from(getOrThrow(id));
    }

    @Transactional
    public EvalGoalResponse create(EvalGoalRequest req) {
        EvalGoal g = EvalGoal.create(
                generateCode(),
                resolveEmployee(req.employeeId()),
                req.period(), req.title(),
                req.weight(), req.targetValue(),
                req.selfScore(), req.status(), req.note());
        return EvalGoalResponse.from(repository.save(g));
    }

    @Transactional
    public EvalGoalResponse update(Long id, EvalGoalRequest req) {
        EvalGoal g = getOrThrow(id);
        g.update(resolveEmployee(req.employeeId()),
                req.period(), req.title(),
                req.weight(), req.targetValue(),
                req.selfScore(), req.status(), req.note());
        return EvalGoalResponse.from(g);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private String generateCode() {
        String prefix = "EG-" + Year.now().getValue() + "-";
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

    private EvalGoal getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("업적목표를 찾을 수 없습니다. id=" + id));
    }
}
