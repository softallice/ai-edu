package com.aiedu.backend.hr;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 부서/직원 시드. */
@Component
@Order(2)
public class HrDataInitializer implements CommandLineRunner {

    private final DepartmentRepository deptRepo;
    private final EmployeeRepository empRepo;

    public HrDataInitializer(DepartmentRepository deptRepo, EmployeeRepository empRepo) {
        this.deptRepo = deptRepo;
        this.empRepo = empRepo;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (deptRepo.count() > 0) return;

        Department hq = deptRepo.save(Department.create("D100", "경영지원본부", 10, true, null));
        Department dev = deptRepo.save(Department.create("D200", "플랫폼개발실", 20, true, hq.getId()));
        Department sales = deptRepo.save(Department.create("D300", "영업본부", 30, true, hq.getId()));

        empRepo.save(Employee.create("EMP-2018-0001", "유원상", true, dev, Position.GENERAL_MANAGER,
                EmploymentType.REGULAR, LocalDate.of(2018, 3, 2), null, new BigDecimal("85000"),
                "yws@nds.co.kr", "02-1234-5678", "010-1111-2222", Gender.MALE, LocalDate.of(1985, 5, 1)));
        empRepo.save(Employee.create("EMP-2020-0002", "김철수", true, dev, Position.MANAGER,
                EmploymentType.REGULAR, LocalDate.of(2020, 1, 6), null, new BigDecimal("65000"),
                "kim@nds.co.kr", "02-1234-5680", "010-3333-4444", Gender.MALE, LocalDate.of(1990, 9, 12)));
        empRepo.save(Employee.create("EMP-2021-0003", "이영희", true, sales, Position.ASSISTANT_MANAGER,
                EmploymentType.REGULAR, LocalDate.of(2021, 7, 1), null, new BigDecimal("55000"),
                "lee@nds.co.kr", "02-1234-5681", "010-5555-6666", Gender.FEMALE, LocalDate.of(1993, 2, 20)));
        empRepo.save(Employee.create("EMP-2023-0004", "박인턴", true, sales, Position.STAFF,
                EmploymentType.INTERN, LocalDate.of(2023, 9, 1), null, new BigDecimal("30000"),
                null, null, "010-7777-8888", Gender.OTHER, LocalDate.of(2000, 11, 3)));
    }
}
