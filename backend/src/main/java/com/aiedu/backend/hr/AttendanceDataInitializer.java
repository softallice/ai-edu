package com.aiedu.backend.hr;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 근태 시드. HR 마스터(직원) 시드 이후 실행됩니다. */
@Component
@Order(11)
public class AttendanceDataInitializer implements CommandLineRunner {

    private final AttendanceRepository repository;
    private final EmployeeRepository employeeRepository;

    public AttendanceDataInitializer(AttendanceRepository repository, EmployeeRepository employeeRepository) {
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

        // 직원1 — 3일치 시드
        repository.save(Attendance.create("AT-2026-0001", emp1,
                LocalDate.of(2026, 6, 25),
                LocalTime.of(9, 0), LocalTime.of(18, 0),
                null, AttendanceStatus.NORMAL, null));
        repository.save(Attendance.create("AT-2026-0002", emp1,
                LocalDate.of(2026, 6, 26),
                LocalTime.of(9, 15), LocalTime.of(18, 0),
                null, AttendanceStatus.LATE, "지각 15분"));
        repository.save(Attendance.create("AT-2026-0003", emp1,
                LocalDate.of(2026, 6, 27),
                null, null,
                BigDecimal.ZERO, AttendanceStatus.ABSENT, "병결"));

        // 직원2 — 2일치 시드
        repository.save(Attendance.create("AT-2026-0004", emp2,
                LocalDate.of(2026, 6, 25),
                LocalTime.of(9, 0), LocalTime.of(18, 30),
                null, AttendanceStatus.NORMAL, null));
        repository.save(Attendance.create("AT-2026-0005", emp2,
                LocalDate.of(2026, 6, 26),
                null, null,
                BigDecimal.ZERO, AttendanceStatus.LEAVE, "연차"));
    }
}
