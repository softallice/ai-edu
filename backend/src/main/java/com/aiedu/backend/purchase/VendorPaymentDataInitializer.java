package com.aiedu.backend.purchase;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 구매대금지급 시드. 구매발주 시드 이후 실행됩니다. */
@Component
@Order(17)
public class VendorPaymentDataInitializer implements CommandLineRunner {

    private final VendorPaymentRepository repository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public VendorPaymentDataInitializer(VendorPaymentRepository repository,
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
        PurchaseOrder po2 = orders.size() > 1 ? orders.get(1) : po1;

        repository.save(VendorPayment.create("VP-2025-0001", po1.getSupplier(), po1,
                LocalDate.of(2025, 1, 31),
                new BigDecimal("5000000"), PaymentMethod.TRANSFER, VendorPaymentStatus.PAID,
                "서버 부품 대금 지급"));
        repository.save(VendorPayment.create("VP-2025-0002", po2.getSupplier(), po2,
                LocalDate.of(2025, 2, 28),
                new BigDecimal("12000000"), PaymentMethod.TRANSFER, VendorPaymentStatus.REQUESTED,
                "네트워크 장비 대금 결재 요청"));
        repository.save(VendorPayment.create("VP-2025-0003", po1.getSupplier(), null,
                LocalDate.of(2025, 3, 15),
                new BigDecimal("2000000"), PaymentMethod.CARD, VendorPaymentStatus.APPROVED,
                "소모품 카드 결제 승인"));
    }
}
