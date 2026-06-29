package com.aiedu.backend.purchase;

import com.aiedu.backend.customer.Customer;
import com.aiedu.backend.customer.CustomerRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 구매발주 시드. 거래처 시드 이후 실행됩니다. */
@Component
@Order(9)
public class PurchaseOrderDataInitializer implements CommandLineRunner {

    private final PurchaseOrderRepository repository;
    private final CustomerRepository customerRepository;

    public PurchaseOrderDataInitializer(PurchaseOrderRepository repository,
            CustomerRepository customerRepository) {
        this.repository = repository;
        this.customerRepository = customerRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (repository.count() > 0) return;
        List<Customer> customers = customerRepository.findAll();
        if (customers.isEmpty()) return;

        Customer supplier = customers.get(0);

        repository.save(PurchaseOrder.create("PO-2025-0001", supplier, null,
                LocalDate.of(2025, 1, 10), LocalDate.of(2025, 1, 31),
                new BigDecimal("5000000"), PurchaseOrderStatus.RECEIVED, "서버 부품 구매"));
        repository.save(PurchaseOrder.create("PO-2025-0002", supplier, null,
                LocalDate.of(2025, 2, 5), LocalDate.of(2025, 2, 28),
                new BigDecimal("12000000"), PurchaseOrderStatus.ORDERED, "네트워크 장비 발주"));
        repository.save(PurchaseOrder.create("PO-2025-0003", supplier, null,
                LocalDate.of(2025, 3, 3), null,
                new BigDecimal("3500000"), PurchaseOrderStatus.DRAFT, "소프트웨어 라이선스 초안"));
    }
}
