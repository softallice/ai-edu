package com.aiedu.backend.sales;

import com.aiedu.backend.hr.EmployeeRepository;
import com.aiedu.backend.pm.ProjectRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 구매의뢰 시드. HR/PM 시드 이후 실행됩니다. */
@Component
@Order(7)
public class PurchaseRequestDataInitializer implements CommandLineRunner {

    private final PurchaseRequestRepository repository;
    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;

    public PurchaseRequestDataInitializer(PurchaseRequestRepository repository,
            ProjectRepository projectRepository, EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.projectRepository = projectRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (repository.count() > 0) return;

        var projects = projectRepository.findAll();
        var employees = employeeRepository.findAll();

        var project = projects.isEmpty() ? null : projects.get(0);
        var requester = employees.isEmpty() ? null : employees.get(0);

        repository.saveAll(List.of(
                PurchaseRequest.create("PR-2025-0001", project, requester,
                        LocalDate.of(2025, 3, 10), "노트북 Dell XPS 15", 2,
                        new BigDecimal("4000000"), PurchaseRequestStatus.APPROVED, "개발팀 교체용"),
                PurchaseRequest.create("PR-2025-0002", project, requester,
                        LocalDate.of(2025, 4, 5), "USB-C 허브", 5,
                        new BigDecimal("500000"), PurchaseRequestStatus.ORDERED, "주변기기"),
                PurchaseRequest.create("PR-2025-0003", null, null,
                        LocalDate.of(2025, 5, 20), "사무용 의자", 3,
                        new BigDecimal("1200000"), PurchaseRequestStatus.REQUESTED, null)));
    }
}
