package com.aiedu.backend.commoncode;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 공통코드 시드. @Order(25) — 독립 엔티티이므로 교차 의존 없음. */
@Component
@Order(25)
public class CommonCodeDataInitializer implements CommandLineRunner {

    private final CommonCodeRepository repository;

    public CommonCodeDataInitializer(CommonCodeRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (repository.count() > 0) return;

        // 경비 유형
        repository.save(CommonCode.create(
                "EXPENSE_TYPE", "MEAL", "식대",
                1, true, "식사비 및 간식비 지출"));
        repository.save(CommonCode.create(
                "EXPENSE_TYPE", "TRANSPORT", "교통비",
                2, true, "대중교통, 택시, 주차비 등 이동 관련 지출"));
        repository.save(CommonCode.create(
                "EXPENSE_TYPE", "TUITION", "교육비",
                3, true, "사내외 교육 수강료 및 도서 구입비"));

        // 인감 유형
        repository.save(CommonCode.create(
                "SEAL_TYPE", "USE", "사용인감",
                1, true, "일반 업무용 사용인감"));
        repository.save(CommonCode.create(
                "SEAL_TYPE", "CORPORATE", "법인인감",
                2, true, "법적 효력이 필요한 법인인감"));
        repository.save(CommonCode.create(
                "SEAL_TYPE", "E_CONTRACT", "전자계약",
                3, true, "전자서명 기반 비대면 계약"));
    }
}
