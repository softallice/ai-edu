package com.aiedu.backend.notice;

import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 교육용 공지 시드. @Order(14) — 독립 엔티티이므로 교차 의존 없음. */
@Component
@Order(14)
public class NoticeDataInitializer implements CommandLineRunner {

    private final NoticeRepository repository;

    public NoticeDataInitializer(NoticeRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (repository.count() > 0) return;

        repository.save(Notice.create(
                "NT-2025-0001",
                "[필독] 시스템 정기 점검 안내 (2025-02-01 02:00~06:00)",
                "매월 첫째 주 토요일 새벽 02:00~06:00에 시스템 정기 점검이 진행됩니다.\n점검 시간 중에는 서비스 이용이 일시 중단되오니 양해 부탁드립니다.",
                "시스템관리자",
                NoticeCategory.SYSTEM,
                LocalDate.of(2025, 1, 20),
                true));

        repository.save(Notice.create(
                "NT-2025-0002",
                "AI-EDU ERP 시스템 v2.0 업데이트 안내",
                "2025년 2월 1일부터 AI-EDU ERP v2.0이 적용됩니다.\n주요 변경사항: 08.공통 모듈 신설, 대시보드 개선, 성능 향상.\n문의사항은 시스템관리자에게 연락해 주세요.",
                "시스템관리자",
                NoticeCategory.SYSTEM,
                LocalDate.of(2025, 1, 25),
                true));

        repository.save(Notice.create(
                "NT-2025-0003",
                "2025년 상반기 교육 일정 안내",
                "2025년 상반기 사내 교육 일정이 확정되었습니다.\n자세한 일정은 HR 포털을 참고해 주세요.",
                "교육담당",
                NoticeCategory.GENERAL,
                LocalDate.of(2025, 2, 1),
                false));
    }
}
