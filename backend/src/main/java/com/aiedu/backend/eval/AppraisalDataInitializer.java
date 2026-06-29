package com.aiedu.backend.eval;

import com.aiedu.backend.hr.Employee;
import com.aiedu.backend.hr.EmployeeRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 업적평가 시드. EvalGoal 시드 이후 실행됩니다. */
@Component
@Order(23)
public class AppraisalDataInitializer implements CommandLineRunner {

    private final AppraisalRepository repository;
    private final EmployeeRepository employeeRepository;
    private final EvalGoalRepository evalGoalRepository;

    public AppraisalDataInitializer(AppraisalRepository repository,
            EmployeeRepository employeeRepository,
            EvalGoalRepository evalGoalRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
        this.evalGoalRepository = evalGoalRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (repository.count() > 0) return;
        List<Employee> employees = employeeRepository.findAll();
        if (employees.isEmpty()) return;

        List<EvalGoal> goals = evalGoalRepository.findAll();
        EvalGoal goal0 = goals.isEmpty() ? null : goals.get(0);
        EvalGoal goal1 = goals.size() > 1 ? goals.get(1) : null;

        Employee emp0 = employees.get(0);
        Employee emp1 = employees.size() > 1 ? employees.get(1) : emp0;
        Employee emp2 = employees.size() > 2 ? employees.get(2) : emp0;

        repository.save(Appraisal.create(
                "AP-2025-0001", emp0, goal0, "2025-상반기",
                new BigDecimal("85.00"), new BigDecimal("88.00"), new BigDecimal("87.00"),
                "A", AppraisalStatus.CONFIRMED, "전반적으로 우수한 성과"));

        repository.save(Appraisal.create(
                "AP-2025-0002", emp1, goal1, "2025-상반기",
                new BigDecimal("78.00"), new BigDecimal("80.00"), null,
                null, AppraisalStatus.SECOND, "2차 평가 진행 중"));

        repository.save(Appraisal.create(
                "AP-2025-0003", emp2, null, "2025-상반기",
                new BigDecimal("90.00"), null, null,
                null, AppraisalStatus.FIRST, "1차 평가 대기"));

        repository.save(Appraisal.create(
                "AP-2025-0004", emp0, null, "2025-상반기",
                new BigDecimal("72.00"), null, null,
                null, AppraisalStatus.FIRST, "목표 대비 보통 수준"));

        repository.save(Appraisal.create(
                "AP-2025-0005", emp1, goal0, "2025-하반기",
                null, null, null,
                null, AppraisalStatus.SELF, "본인평가 작성 중"));

        repository.save(Appraisal.create(
                "AP-2025-0006", emp2, null, "2025-하반기",
                new BigDecimal("95.00"), new BigDecimal("93.00"), new BigDecimal("94.00"),
                "S", AppraisalStatus.CONFIRMED, "탁월한 성과 달성"));

        repository.save(Appraisal.create(
                "AP-2025-0007", emp0, goal1, "2025-하반기",
                new BigDecimal("65.00"), new BigDecimal("68.00"), new BigDecimal("67.00"),
                "C", AppraisalStatus.CONFIRMED, "개선 필요"));

        repository.save(Appraisal.create(
                "AP-2025-0008", emp1, null, "2025-하반기",
                null, null, null,
                null, AppraisalStatus.SELF, "평가 시작 전"));
    }
}
