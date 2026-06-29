package com.aiedu.backend.finance;

import com.aiedu.backend.hr.Employee;
import com.aiedu.backend.hr.EmployeeRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 법인카드 거래내역 시드. @Order(18) — HR 이후 실행. */
@Component
@Order(18)
public class CardTransactionDataInitializer implements CommandLineRunner {

    private final CardTransactionRepository repository;
    private final EmployeeRepository employeeRepository;

    public CardTransactionDataInitializer(CardTransactionRepository repository,
            EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (repository.count() > 0) return;

        List<Employee> employees = employeeRepository.findAll();
        Employee emp1 = employees.size() > 0 ? employees.get(0) : null;
        Employee emp2 = employees.size() > 1 ? employees.get(1) : null;

        // 2025년 다양한 달, 가맹점, 상태 시드
        repository.save(CardTransaction.create(
                "CC-2025-0001", "1234-****-****-5678",
                LocalDate.of(2025, 1, 15), "스타벅스 강남점",
                new BigDecimal("15000"), new BigDecimal("15000"),
                "2025-02", CardTransactionStatus.PAID, emp1, "팀 회의 식대"));

        repository.save(CardTransaction.create(
                "CC-2025-0002", "1234-****-****-5678",
                LocalDate.of(2025, 2, 8), "GS칼텍스 서초주유소",
                new BigDecimal("85000"), new BigDecimal("85000"),
                "2025-03", CardTransactionStatus.PAID, emp1, "업무 차량 주유"));

        repository.save(CardTransaction.create(
                "CC-2025-0003", "9876-****-****-1234",
                LocalDate.of(2025, 3, 22), "교보문고 강남점",
                new BigDecimal("42000"), new BigDecimal("42000"),
                "2025-04", CardTransactionStatus.BILLED, emp2, "교육 도서 구입"));

        repository.save(CardTransaction.create(
                "CC-2025-0004", "9876-****-****-1234",
                LocalDate.of(2025, 4, 5), "이마트 역삼점",
                new BigDecimal("128000"), new BigDecimal("128000"),
                "2025-05", CardTransactionStatus.BILLED, emp2, "사무용 소모품"));

        repository.save(CardTransaction.create(
                "CC-2025-0005", "1234-****-****-5678",
                LocalDate.of(2025, 5, 17), "한식당 미가",
                new BigDecimal("65000"), BigDecimal.ZERO,
                null, CardTransactionStatus.PURCHASED, emp1, "거래처 접대 식대"));

        repository.save(CardTransaction.create(
                "CC-2025-0006", "9876-****-****-1234",
                LocalDate.of(2025, 6, 3), "올리브영 삼성점",
                new BigDecimal("33500"), BigDecimal.ZERO,
                null, CardTransactionStatus.APPROVED, emp2, "위생용품 구입"));
    }
}
