package com.aiedu.backend.hr;

import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 인적사항 시드. HR 마스터(직원) 시드 이후 실행됩니다. */
@Component
@Order(20)
public class EmployeeRecordDataInitializer implements CommandLineRunner {

    private final EmployeeRecordRepository repository;
    private final EmployeeRepository employeeRepository;

    public EmployeeRecordDataInitializer(EmployeeRecordRepository repository,
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

        // 직원1 — 학력
        repository.save(EmployeeRecord.create("ER-2025-0001", emp1,
                EmployeeRecordType.EDUCATION,
                "서울대학교", "공과대학 컴퓨터공학과",
                LocalDate.of(2010, 3, 1), LocalDate.of(2014, 2, 28),
                "학사 졸업", null));

        // 직원1 — 경력
        repository.save(EmployeeRecord.create("ER-2025-0002", emp1,
                EmployeeRecordType.CAREER,
                "삼성SDS", "IT서비스사업부",
                LocalDate.of(2014, 3, 1), LocalDate.of(2019, 8, 31),
                "ERP 시스템 개발 및 운영", null));

        // 직원1 — 업무이력
        repository.save(EmployeeRecord.create("ER-2025-0003", emp1,
                EmployeeRecordType.WORK,
                "ERP 고도화 프로젝트", "정보시스템팀",
                LocalDate.of(2023, 1, 1), LocalDate.of(2023, 12, 31),
                "Spring Boot 기반 ERP 시스템 전면 재구축", null));

        // 직원2 — 학력
        repository.save(EmployeeRecord.create("ER-2025-0004", emp2,
                EmployeeRecordType.EDUCATION,
                "연세대학교", "경영학과",
                LocalDate.of(2012, 3, 1), LocalDate.of(2016, 2, 29),
                "학사 졸업", null));

        // 직원2 — 경력
        repository.save(EmployeeRecord.create("ER-2025-0005", emp2,
                EmployeeRecordType.CAREER,
                "LG CNS", "금융솔루션사업부",
                LocalDate.of(2016, 3, 1), LocalDate.of(2021, 6, 30),
                "금융 SI 프로젝트 PM", null));

        // 직원2 — 업무이력
        repository.save(EmployeeRecord.create("ER-2025-0006", emp2,
                EmployeeRecordType.WORK,
                "영업지원시스템 구축", "영업기획팀",
                LocalDate.of(2022, 6, 1), LocalDate.of(2023, 3, 31),
                "CRM 연동 영업지원 플랫폼 개발", "외부 업체 협업"));

        // 직원3 — 학력
        repository.save(EmployeeRecord.create("ER-2025-0007", emp3,
                EmployeeRecordType.EDUCATION,
                "고려대학교", "전자공학과",
                LocalDate.of(2015, 3, 1), null,
                "석사 과정 재학 중", null));

        // 직원3 — 업무이력
        repository.save(EmployeeRecord.create("ER-2025-0008", emp3,
                EmployeeRecordType.WORK,
                "AI 교육 플랫폼 개발", "R&D팀",
                LocalDate.of(2024, 1, 1), null,
                "LLM 기반 학습 추천 시스템 설계 및 구현", "진행 중"));
    }
}
