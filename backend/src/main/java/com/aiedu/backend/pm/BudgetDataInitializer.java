package com.aiedu.backend.pm;

import com.aiedu.backend.hr.Department;
import com.aiedu.backend.hr.DepartmentRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 예산대실적 시드. 부서·프로젝트 시드 이후 실행됩니다. */
@Component
@Order(15)
public class BudgetDataInitializer implements CommandLineRunner {

    private final BudgetRepository repository;
    private final DepartmentRepository departmentRepository;
    private final ProjectRepository projectRepository;

    public BudgetDataInitializer(BudgetRepository repository,
            DepartmentRepository departmentRepository,
            ProjectRepository projectRepository) {
        this.repository = repository;
        this.departmentRepository = departmentRepository;
        this.projectRepository = projectRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (repository.count() > 0) return;

        List<Department> departments = departmentRepository.findAll();
        List<Project> projects = projectRepository.findAll();

        // 부서·프로젝트 둘 다 없으면 시드 건너뜀
        if (departments.isEmpty() && projects.isEmpty()) return;

        // TEAM 예산 2건
        if (!departments.isEmpty()) {
            Department dept = departments.get(0);
            repository.save(Budget.create("BG-2025-0001", BudgetType.TEAM, dept, null,
                    2025, "인건비",
                    new BigDecimal("120000000"), new BigDecimal("98000000"),
                    "팀 인건비 예산"));
            repository.save(Budget.create("BG-2025-0002", BudgetType.TEAM, dept, null,
                    2025, "경비",
                    new BigDecimal("20000000"), new BigDecimal("15400000"),
                    "팀 경비 예산"));
        }

        // PROJECT 예산 2건
        if (!projects.isEmpty()) {
            Project proj = projects.get(0);
            repository.save(Budget.create("BG-2025-0003", BudgetType.PROJECT, null, proj,
                    2025, "외주비",
                    new BigDecimal("50000000"), new BigDecimal("32000000"),
                    "프로젝트 외주 개발비"));
            repository.save(Budget.create("BG-2025-0004", BudgetType.PROJECT, null, proj,
                    2025, "경비",
                    new BigDecimal("8000000"), new BigDecimal("4200000"),
                    "프로젝트 출장·운영비"));
        }
    }
}
