package com.aiedu.backend.sales;

import com.aiedu.backend.customer.Customer;
import com.aiedu.backend.customer.CustomerRepository;
import com.aiedu.backend.pm.ProjectRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 제안내역 시드. 거래처 시드 이후 실행됩니다. */
@Component
@Order(8)
public class ProposalDataInitializer implements CommandLineRunner {

    private final ProposalRepository repository;
    private final CustomerRepository customerRepository;
    private final ProjectRepository projectRepository;

    public ProposalDataInitializer(ProposalRepository repository,
            CustomerRepository customerRepository, ProjectRepository projectRepository) {
        this.repository = repository;
        this.customerRepository = customerRepository;
        this.projectRepository = projectRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (repository.count() > 0) return;
        List<Customer> customers = customerRepository.findAll();
        if (customers.isEmpty()) return;

        Customer customer = customers.get(0);

        repository.save(Proposal.create("PP-2025-0001", customer, null,
                LocalDate.of(2025, 3, 10),
                "2025년 AI 교육 플랫폼 구축 제안",
                new BigDecimal("150000000"), ProposalStatus.SUBMITTED, "1차 제안서"));

        repository.save(Proposal.create("PP-2025-0002", customer, null,
                LocalDate.of(2025, 5, 20),
                "클라우드 인프라 전환 컨설팅 제안",
                new BigDecimal("80000000"), ProposalStatus.WON, "수주 확정"));

        repository.save(Proposal.create("PP-2025-0003", customer, null,
                LocalDate.of(2025, 6, 1),
                "데이터 분석 고도화 솔루션 제안",
                new BigDecimal("200000000"), ProposalStatus.DRAFT, null));
    }
}
