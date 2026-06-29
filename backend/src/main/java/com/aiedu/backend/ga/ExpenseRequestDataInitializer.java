package com.aiedu.backend.ga;

import com.aiedu.backend.hr.Employee;
import com.aiedu.backend.hr.EmployeeRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 지출품의 시드. HR 시드 이후 실행됩니다. */
@Component
@Order(13)
public class ExpenseRequestDataInitializer implements CommandLineRunner {

    private final ExpenseRequestRepository repository;
    private final EmployeeRepository employeeRepository;

    public ExpenseRequestDataInitializer(ExpenseRequestRepository repository,
            EmployeeRepository employeeRepository) {
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

        repository.save(ExpenseRequest.create(
                "EX-2025-0001", emp, ExpenseType.MEAL,
                "팀 회식비 신청", new BigDecimal("150000"),
                LocalDate.of(2025, 3, 10), "1분기 팀빌딩 회식", ExpenseStatus.APPROVED));
        repository.save(ExpenseRequest.create(
                "EX-2025-0002", emp, ExpenseType.TRANSPORT,
                "출장 교통비 신청", new BigDecimal("45000"),
                LocalDate.of(2025, 3, 15), "고객사 방문 교통비", ExpenseStatus.REQUESTED));
        repository.save(ExpenseRequest.create(
                "EX-2025-0003", emp, ExpenseType.TUITION,
                "외부 교육비 신청", new BigDecimal("300000"),
                LocalDate.of(2025, 4, 1), "Spring Boot 심화 과정 수강료", ExpenseStatus.PAID));
    }
}
