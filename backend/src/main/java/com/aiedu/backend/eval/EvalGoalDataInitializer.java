package com.aiedu.backend.eval;

import com.aiedu.backend.hr.Employee;
import com.aiedu.backend.hr.EmployeeRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 업적목표 시드. HR 시드 이후 실행됩니다. */
@Component
@Order(12)
public class EvalGoalDataInitializer implements CommandLineRunner {

    private final EvalGoalRepository repository;
    private final EmployeeRepository employeeRepository;

    public EvalGoalDataInitializer(EvalGoalRepository repository, EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (repository.count() > 0) return;
        List<Employee> employees = employeeRepository.findAll();
        if (employees.isEmpty()) return;

        Employee emp = employees.get(0);

        repository.save(EvalGoal.create(
                "EG-2025-0001", emp, "2025-상반기",
                "핵심 제품 출시 일정 준수",
                40, "분기 내 정시 출시율 95% 이상",
                null, EvalGoalStatus.CONFIRMED, "1분기 주요 목표"));

        repository.save(EvalGoal.create(
                "EG-2025-0002", emp, "2025-상반기",
                "고객 만족도 향상",
                30, "CSAT 4.5점 이상 달성",
                new BigDecimal("88.00"), EvalGoalStatus.EVALUATED, "고객 피드백 반영"));

        repository.save(EvalGoal.create(
                "EG-2025-0003", emp, "2025-하반기",
                "신규 거래처 개발",
                30, "신규 계약 3건 이상",
                null, EvalGoalStatus.DRAFT, "하반기 목표 초안"));
    }
}
