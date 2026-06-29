package com.aiedu.backend.sales;

import com.aiedu.backend.customer.Customer;
import com.aiedu.backend.customer.CustomerRepository;
import com.aiedu.backend.hr.Employee;
import com.aiedu.backend.hr.EmployeeRepository;
import com.aiedu.backend.pm.Project;
import com.aiedu.backend.pm.ProjectRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 계약/품목 시드. 거래처·프로젝트·직원 시드 이후 실행됩니다. */
@Component
@Order(4)
public class SalesDataInitializer implements CommandLineRunner {

    private final ContractRepository contractRepo;
    private final CustomerRepository customerRepo;
    private final ProjectRepository projectRepo;
    private final EmployeeRepository employeeRepo;

    public SalesDataInitializer(ContractRepository contractRepo, CustomerRepository customerRepo,
            ProjectRepository projectRepo, EmployeeRepository employeeRepo) {
        this.contractRepo = contractRepo;
        this.customerRepo = customerRepo;
        this.projectRepo = projectRepo;
        this.employeeRepo = employeeRepo;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (contractRepo.count() > 0) return;
        Customer customer = customerRepo.findAll().stream().findFirst().orElse(null);
        if (customer == null) return; // 계약은 거래처가 필수

        List<Project> projects = projectRepo.findAll();
        Project project = projects.isEmpty() ? null : projects.get(0);
        Employee owner = employeeRepo.findAll().stream().findFirst().orElse(null);

        Contract c1 = Contract.create("CT-2025-001", "NDS ERP 차세대 구축 계약", customer, project, owner,
                ContractState.IN_PROGRESS, LocalDate.of(2025, 1, 2), LocalDate.of(2025, 1, 2),
                LocalDate.of(2025, 12, 31), "KRW", "1차 본계약", true);
        c1.replaceLines(List.of(
                ContractLine.create("ERP 라이선스", "Enterprise", new BigDecimal("1"),
                        new BigDecimal("120000000"), null),
                ContractLine.create("구축 용역", "12개월", new BigDecimal("12"),
                        new BigDecimal("15000000"), "월 단가")));
        contractRepo.save(c1);

        Project project2 = projects.size() > 1 ? projects.get(1) : project;
        Contract c2 = Contract.create("CT-2025-002", "AWS MSP 운영 위탁 계약", customer, project2, owner,
                ContractState.SIGNED, LocalDate.of(2025, 3, 1), LocalDate.of(2025, 3, 1),
                LocalDate.of(2026, 2, 28), "KRW", "연간 운영 위탁", true);
        c2.replaceLines(List.of(
                ContractLine.create("관리 수수료", "월정액", new BigDecimal("12"),
                        new BigDecimal("8000000"), "MSP 기본료"),
                ContractLine.create("긴급 지원", "건당", new BigDecimal("10"),
                        new BigDecimal("500000"), null)));
        contractRepo.save(c2);
    }
}
