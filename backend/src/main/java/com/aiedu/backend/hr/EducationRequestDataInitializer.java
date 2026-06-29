package com.aiedu.backend.hr;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 교육신청 시드. HR 마스터(직원) 시드 이후 실행됩니다. */
@Component
@Order(22)
public class EducationRequestDataInitializer implements CommandLineRunner {

    private final EducationRequestRepository repository;
    private final EmployeeRepository employeeRepository;

    public EducationRequestDataInitializer(EducationRequestRepository repository,
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

        Employee emp1 = employees.get(0);
        Employee emp2 = employees.size() > 1 ? employees.get(1) : emp1;
        Employee emp3 = employees.size() > 2 ? employees.get(2) : emp1;

        // 직원1 — 외부교육 승인
        repository.save(EducationRequest.create("ED-2025-0001", emp1,
                EducationType.EXTERNAL,
                "Spring Boot 마이크로서비스 아키텍처 과정",
                "한국소프트웨어산업협회",
                LocalDate.of(2025, 2, 10), LocalDate.of(2025, 2, 12),
                new BigDecimal("450000"),
                EducationStatus.APPROVED, null, null));

        // 직원1 — 자격증 완료
        repository.save(EducationRequest.create("ED-2025-0002", emp1,
                EducationType.CERT,
                "AWS Certified Solutions Architect",
                "AWS Korea",
                LocalDate.of(2025, 3, 22), LocalDate.of(2025, 3, 22),
                new BigDecimal("150000"),
                EducationStatus.COMPLETED, "합격", null));

        // 직원1 — 외부교육 신청
        repository.save(EducationRequest.create("ED-2025-0003", emp1,
                EducationType.EXTERNAL,
                "데이터 분석 실무 과정",
                "패스트캠퍼스",
                LocalDate.of(2025, 9, 1), LocalDate.of(2025, 9, 5),
                new BigDecimal("320000"),
                EducationStatus.REQUESTED, null, null));

        // 직원2 — 자격증 승인
        repository.save(EducationRequest.create("ED-2025-0004", emp2,
                EducationType.CERT,
                "정보처리기사 실기",
                "한국산업인력공단",
                LocalDate.of(2025, 4, 19), LocalDate.of(2025, 4, 19),
                new BigDecimal("20000"),
                EducationStatus.APPROVED, null, null));

        // 직원2 — 외부교육 완료
        repository.save(EducationRequest.create("ED-2025-0005", emp2,
                EducationType.EXTERNAL,
                "리더십과 조직관리 심화 과정",
                "IGM 세계경영연구원",
                LocalDate.of(2025, 5, 14), LocalDate.of(2025, 5, 16),
                new BigDecimal("780000"),
                EducationStatus.COMPLETED, "수료", null));

        // 직원2 — 외부교육 취소
        repository.save(EducationRequest.create("ED-2025-0006", emp2,
                EducationType.EXTERNAL,
                "프로젝트 관리(PMP) 취득 준비반",
                "PMI Korea Chapter",
                LocalDate.of(2025, 7, 7), LocalDate.of(2025, 7, 11),
                new BigDecimal("550000"),
                EducationStatus.CANCELED, null, "일정 충돌로 취소"));

        // 직원3 — 자격증 신청
        repository.save(EducationRequest.create("ED-2025-0007", emp3,
                EducationType.CERT,
                "SQLD(SQL 개발자) 자격증",
                "한국데이터산업진흥원",
                LocalDate.of(2025, 10, 18), LocalDate.of(2025, 10, 18),
                new BigDecimal("50000"),
                EducationStatus.REQUESTED, null, null));
    }
}
