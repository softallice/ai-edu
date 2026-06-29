package com.aiedu.backend.sales;

import com.aiedu.backend.customer.Customer;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 매출세금계산서 시드. 계약 시드 이후 실행됩니다. */
@Component
@Order(5)
public class TaxInvoiceDataInitializer implements CommandLineRunner {

    private final TaxInvoiceRepository repository;
    private final ContractRepository contractRepo;

    public TaxInvoiceDataInitializer(TaxInvoiceRepository repository, ContractRepository contractRepo) {
        this.repository = repository;
        this.contractRepo = contractRepo;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (repository.count() > 0) return;
        List<Contract> contracts = contractRepo.findAll();
        if (contracts.isEmpty()) return;

        Contract c1 = contracts.get(0);
        Customer customer = c1.getCustomer();

        repository.save(TaxInvoice.create("TI-2025-0001", customer, c1, LocalDate.of(2025, 1, 31),
                new BigDecimal("30000000"), new BigDecimal("3000000"), TaxInvoiceStatus.SENT, "1월 기성"));
        repository.save(TaxInvoice.create("TI-2025-0002", customer, c1, LocalDate.of(2025, 2, 28),
                new BigDecimal("30000000"), new BigDecimal("3000000"), TaxInvoiceStatus.ISSUED, "2월 기성"));
    }
}
