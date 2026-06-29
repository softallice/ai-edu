package com.aiedu.backend.finance;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 전표 시드. FK 없이 독립 실행. */
@Component
@Order(10)
public class VoucherDataInitializer implements CommandLineRunner {

    private final VoucherRepository repository;

    public VoucherDataInitializer(VoucherRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (repository.count() > 0) return;

        repository.save(Voucher.create("JV-2025-0001", LocalDate.of(2025, 1, 31),
                "매출채권", new BigDecimal("33000000"), BigDecimal.ZERO,
                "1월 기성 매출 계상", null));
        repository.save(Voucher.create("JV-2025-0002", LocalDate.of(2025, 1, 31),
                "부가세예수금", BigDecimal.ZERO, new BigDecimal("3000000"),
                "1월 부가세 대변", null));
        repository.save(Voucher.create("JV-2025-0003", LocalDate.of(2025, 2, 28),
                "현금및현금성자산", new BigDecimal("33000000"), BigDecimal.ZERO,
                "2월 수금 처리", null));
    }
}
