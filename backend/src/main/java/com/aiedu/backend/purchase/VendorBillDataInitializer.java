package com.aiedu.backend.purchase;

import com.aiedu.backend.customer.Customer;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 매입세금계산서 시드. 발주 시드 이후 실행됩니다. */
@Component
@Order(16)
public class VendorBillDataInitializer implements CommandLineRunner {

    private final VendorBillRepository repository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public VendorBillDataInitializer(VendorBillRepository repository,
            PurchaseOrderRepository purchaseOrderRepository) {
        this.repository = repository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (repository.count() > 0) return;
        List<PurchaseOrder> orders = purchaseOrderRepository.findAll();
        if (orders.isEmpty()) return;

        PurchaseOrder po1 = orders.get(0);
        Customer supplier = po1.getSupplier();

        PurchaseOrder po2 = orders.size() > 1 ? orders.get(1) : po1;

        repository.save(VendorBill.create("VB-2025-0001", supplier, po1,
                VendorBillType.GOODS, LocalDate.of(2025, 1, 31),
                new BigDecimal("5000000"), new BigDecimal("500000"),
                VendorBillStatus.CONFIRMED, "서버 부품 매입"));
        repository.save(VendorBill.create("VB-2025-0002", supplier, po2,
                VendorBillType.SERVICE, LocalDate.of(2025, 2, 28),
                new BigDecimal("12000000"), new BigDecimal("1200000"),
                VendorBillStatus.DRAFT, "네트워크 구축 용역"));
    }
}
