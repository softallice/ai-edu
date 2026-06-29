package com.aiedu.backend.ga;

import com.aiedu.backend.hr.Employee;
import com.aiedu.backend.hr.EmployeeRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 인감신청 시드. HR 시드 이후 실행됩니다. */
@Component
@Order(24)
public class SealRequestDataInitializer implements CommandLineRunner {

    private final SealRequestRepository repository;
    private final EmployeeRepository employeeRepository;

    public SealRequestDataInitializer(SealRequestRepository repository,
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

        repository.save(SealRequest.create(
                "SL-2025-0001", emp, SealType.USE,
                "계약서 사용인감 날인 요청",
                "거래처 납품 계약서 날인",
                LocalDate.of(2025, 3, 5),
                SealStatus.APPROVED));

        repository.save(SealRequest.create(
                "SL-2025-0002", emp, SealType.CORPORATE,
                "법인인감 날인 신청",
                "금융기관 제출용 서류",
                LocalDate.of(2025, 3, 12),
                SealStatus.COMPLETED));

        repository.save(SealRequest.create(
                "SL-2025-0003", emp, SealType.USE_EXPORT,
                "사용인감 외부 반출 신청",
                "지방 출장 계약 체결",
                LocalDate.of(2025, 4, 2),
                SealStatus.REQUESTED));

        repository.save(SealRequest.create(
                "SL-2025-0004", emp, SealType.FINGERPRINT_EXPORT,
                "지문인식기 반출 요청",
                "신규 사업장 설치",
                LocalDate.of(2025, 4, 15),
                SealStatus.REJECTED));

        repository.save(SealRequest.create(
                "SL-2025-0005", emp, SealType.E_CONTRACT,
                "전자계약 체결 신청",
                "온라인 서비스 이용 계약",
                LocalDate.of(2025, 5, 1),
                SealStatus.REQUESTED));
    }
}
