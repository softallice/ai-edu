package com.aiedu.backend.pm;

import com.aiedu.backend.customer.Customer;
import com.aiedu.backend.customer.CustomerRepository;
import com.aiedu.backend.hr.Employee;
import com.aiedu.backend.hr.EmployeeRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 프로젝트/활동시간 시드. 직원·거래처 시드 이후 실행됩니다. */
@Component
@Order(3)
public class PmDataInitializer implements CommandLineRunner {

    private final ProjectRepository projectRepo;
    private final TimesheetRepository timesheetRepo;
    private final EmployeeRepository employeeRepo;
    private final CustomerRepository customerRepo;

    public PmDataInitializer(ProjectRepository projectRepo, TimesheetRepository timesheetRepo,
            EmployeeRepository employeeRepo, CustomerRepository customerRepo) {
        this.projectRepo = projectRepo;
        this.timesheetRepo = timesheetRepo;
        this.employeeRepo = employeeRepo;
        this.customerRepo = customerRepo;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (projectRepo.count() > 0) return;
        List<Employee> emps = employeeRepo.findAll();
        if (emps.isEmpty()) return;

        Employee pm = emps.get(0);
        Customer customer = customerRepo.findAll().stream().findFirst().orElse(null);

        Project p1 = projectRepo.save(Project.create("PRJ-2025-001", "NDS ERP 차세대 구축", customer, pm,
                ProjectStatus.IN_PROGRESS, LocalDate.of(2025, 1, 2), LocalDate.of(2025, 12, 31), true));
        Project p2 = projectRepo.save(Project.create("PRJ-2025-002", "AWS MSP 운영 고도화", customer, pm,
                ProjectStatus.IN_PROGRESS, LocalDate.of(2025, 3, 1), LocalDate.of(2026, 2, 28), true));
        Project p3 = projectRepo.save(Project.create("PRJ-2025-003", "사내 교육포털 개편", null, pm,
                ProjectStatus.PLANNED, LocalDate.of(2025, 7, 1), null, true));

        Employee e0 = emps.get(0);
        Employee e1 = emps.size() > 1 ? emps.get(1) : e0;

        timesheetRepo.save(Timesheet.create(e0, p1, LocalDate.of(2025, 6, 2), new BigDecimal("8.00"),
                ActivityType.DEVELOPMENT, "코어 모듈 설계", true));
        timesheetRepo.save(Timesheet.create(e0, p1, LocalDate.of(2025, 6, 3), new BigDecimal("6.50"),
                ActivityType.MEETING, "고객 요구사항 회의", true));
        timesheetRepo.save(Timesheet.create(e1, p2, LocalDate.of(2025, 6, 3), new BigDecimal("7.00"),
                ActivityType.SUPPORT, "운영 이슈 대응", false));
        timesheetRepo.save(Timesheet.create(e1, p2, LocalDate.of(2025, 6, 4), new BigDecimal("8.00"),
                ActivityType.DOCUMENTATION, "운영 매뉴얼 작성", false));
        timesheetRepo.save(Timesheet.create(e0, p3, LocalDate.of(2025, 6, 4), new BigDecimal("4.00"),
                ActivityType.DESIGN, "포털 화면 설계", false));
    }
}
