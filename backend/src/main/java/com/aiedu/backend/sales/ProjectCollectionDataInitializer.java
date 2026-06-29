package com.aiedu.backend.sales;

import com.aiedu.backend.customer.Customer;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 프로젝트수금 시드. 세금계산서 시드 이후 실행됩니다. */
@Component
@Order(6)
public class ProjectCollectionDataInitializer implements CommandLineRunner {

    private final ProjectCollectionRepository repository;
    private final ContractRepository contractRepository;

    public ProjectCollectionDataInitializer(ProjectCollectionRepository repository,
            ContractRepository contractRepository) {
        this.repository = repository;
        this.contractRepository = contractRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (repository.count() > 0) return;
        List<Contract> contracts = contractRepository.findAll();
        if (contracts.isEmpty()) return;

        Contract c1 = contracts.get(0);
        Customer customer = c1.getCustomer();

        repository.save(ProjectCollection.create("RC-2025-0001", customer, c1, null,
                LocalDate.of(2025, 3, 31), LocalDate.of(2025, 3, 28),
                new BigDecimal("33000000"), CollectionMethod.TRANSFER,
                CollectionStatus.COLLECTED, "1차 수금"));
        repository.save(ProjectCollection.create("RC-2025-0002", customer, c1, null,
                LocalDate.of(2025, 6, 30), null,
                new BigDecimal("33000000"), CollectionMethod.TRANSFER,
                CollectionStatus.PLANNED, "2차 수금"));
    }
}
