package com.aiedu.backend.hr;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 휴가/근로신청 시드. HR 마스터(직원) 시드 이후 실행됩니다. */
@Component
@Order(19)
public class LeaveRequestDataInitializer implements CommandLineRunner {

    private final LeaveRequestRepository repository;
    private final EmployeeRepository employeeRepository;

    public LeaveRequestDataInitializer(LeaveRequestRepository repository, EmployeeRepository employeeRepository) {
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

        // 직원1 — 연차 승인
        repository.save(LeaveRequest.create("LR-2025-0001", emp1,
                LeaveRequestType.ANNUAL,
                LocalDate.of(2025, 3, 10), LocalDate.of(2025, 3, 12),
                new BigDecimal("3.0"), null,
                "개인 사유", LeaveRequestStatus.APPROVED, null));

        // 직원1 — 반차 신청
        repository.save(LeaveRequest.create("LR-2025-0002", emp1,
                LeaveRequestType.HALF_DAY,
                LocalDate.of(2025, 4, 15), LocalDate.of(2025, 4, 15),
                new BigDecimal("0.5"), null,
                "오후 반차", LeaveRequestStatus.REQUESTED, null));

        // 직원1 — 연장근로 승인
        repository.save(LeaveRequest.create("LR-2025-0003", emp1,
                LeaveRequestType.OVERTIME,
                LocalDate.of(2025, 5, 20), LocalDate.of(2025, 5, 20),
                null, new BigDecimal("3.0"),
                "월말 결산", LeaveRequestStatus.APPROVED, null));

        // 직원2 — 병가 신청
        repository.save(LeaveRequest.create("LR-2025-0004", emp2,
                LeaveRequestType.SICK,
                LocalDate.of(2025, 2, 5), LocalDate.of(2025, 2, 7),
                new BigDecimal("3.0"), null,
                "독감", LeaveRequestStatus.APPROVED, "진단서 제출"));

        // 직원2 — 경조 승인
        repository.save(LeaveRequest.create("LR-2025-0005", emp2,
                LeaveRequestType.SPECIAL,
                LocalDate.of(2025, 6, 2), LocalDate.of(2025, 6, 3),
                new BigDecimal("2.0"), null,
                "결혼식 참석", LeaveRequestStatus.APPROVED, null));

        // 직원2 — 휴일근로 취소
        repository.save(LeaveRequest.create("LR-2025-0006", emp2,
                LeaveRequestType.HOLIDAY_WORK,
                LocalDate.of(2025, 7, 13), LocalDate.of(2025, 7, 13),
                null, new BigDecimal("8.0"),
                "프로젝트 긴급 대응", LeaveRequestStatus.CANCELED, null));

        // 직원3 — 연차 신청
        repository.save(LeaveRequest.create("LR-2025-0007", emp3,
                LeaveRequestType.ANNUAL,
                LocalDate.of(2025, 8, 11), LocalDate.of(2025, 8, 15),
                new BigDecimal("5.0"), null,
                "여름 휴가", LeaveRequestStatus.REQUESTED, null));

        // 직원3 — 연장근로 승인
        repository.save(LeaveRequest.create("LR-2025-0008", emp3,
                LeaveRequestType.OVERTIME,
                LocalDate.of(2025, 9, 25), LocalDate.of(2025, 9, 25),
                null, new BigDecimal("2.0"),
                "야간 배포 작업", LeaveRequestStatus.APPROVED, null));
    }
}
