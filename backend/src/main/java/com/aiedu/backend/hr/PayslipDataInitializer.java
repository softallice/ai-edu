package com.aiedu.backend.hr;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 급여명세 시드. HR 마스터(직원) 시드 이후 실행됩니다. */
@Component
@Order(21)
public class PayslipDataInitializer implements CommandLineRunner {

    private final PayslipRepository repository;
    private final EmployeeRepository employeeRepository;

    public PayslipDataInitializer(PayslipRepository repository, EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (repository.count() > 0) return;
        List<Employee> employees = employeeRepository.findAll();
        if (employees.isEmpty()) return;

        Employee emp1 = employees.get(0);
        Employee emp2 = employees.size() > 1 ? employees.get(1) : emp1;
        Employee emp3 = employees.size() > 2 ? employees.get(2) : emp1;

        // 직원1 — 2025년 1월 지급완료
        repository.save(Payslip.create("PS-2025-0001", emp1, "2025-01",
                new BigDecimal("4000000"), new BigDecimal("300000"),
                BigDecimal.ZERO, new BigDecimal("450000"),
                PayslipStatus.PAID, null));

        // 직원1 — 2025년 2월 지급완료
        repository.save(Payslip.create("PS-2025-0002", emp1, "2025-02",
                new BigDecimal("4000000"), new BigDecimal("300000"),
                BigDecimal.ZERO, new BigDecimal("450000"),
                PayslipStatus.PAID, null));

        // 직원1 — 2025년 3월 확정(성과금 포함)
        repository.save(Payslip.create("PS-2025-0003", emp1, "2025-03",
                new BigDecimal("4000000"), new BigDecimal("300000"),
                new BigDecimal("1000000"), new BigDecimal("490000"),
                PayslipStatus.CONFIRMED, "1분기 성과금"));

        // 직원2 — 2025년 1월 지급완료
        repository.save(Payslip.create("PS-2025-0004", emp2, "2025-01",
                new BigDecimal("3500000"), new BigDecimal("200000"),
                BigDecimal.ZERO, new BigDecimal("390000"),
                PayslipStatus.PAID, null));

        // 직원2 — 2025년 2월 지급완료
        repository.save(Payslip.create("PS-2025-0005", emp2, "2025-02",
                new BigDecimal("3500000"), new BigDecimal("200000"),
                BigDecimal.ZERO, new BigDecimal("390000"),
                PayslipStatus.PAID, null));

        // 직원2 — 2025년 3월 확정(성과금 포함)
        repository.save(Payslip.create("PS-2025-0006", emp2, "2025-03",
                new BigDecimal("3500000"), new BigDecimal("200000"),
                new BigDecimal("800000"), new BigDecimal("418000"),
                PayslipStatus.CONFIRMED, "1분기 성과금"));

        // 직원3 — 2025년 2월 지급완료
        repository.save(Payslip.create("PS-2025-0007", emp3, "2025-02",
                new BigDecimal("3200000"), new BigDecimal("150000"),
                BigDecimal.ZERO, new BigDecimal("353000"),
                PayslipStatus.PAID, null));

        // 직원3 — 2025년 3월 작성(미확정)
        repository.save(Payslip.create("PS-2025-0008", emp3, "2025-03",
                new BigDecimal("3200000"), new BigDecimal("150000"),
                BigDecimal.ZERO, new BigDecimal("353000"),
                PayslipStatus.DRAFT, null));
    }
}
