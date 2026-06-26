package com.aiedu.backend.customer;

import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 교육용 거래처 시드 데이터.
 *
 * <p>거래처는 담당자(자식)를 가진 애그리거트라 FK 순서 때문에 단순 data.sql 보다
 * 코드로 적재하는 편이 명확합니다. 비어 있을 때만 적재하므로 재기동/영속 상황에서도
 * 중복 적재되지 않습니다.
 */
@Component
public class CustomerDataInitializer implements CommandLineRunner {

    private final CustomerRepository customerRepository;

    public CustomerDataInitializer(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (customerRepository.count() > 0) {
            return;
        }

        Customer nds = Customer.create("000001", "1078647093", "엔디에스(주)", "NDS", TradeType.BOTH,
                "홍길동", "110111-1234567", "정보서비스업", "소프트웨어 개발", "06234",
                "서울특별시 강남구 테헤란로 1", "10층", "02-1234-5678", "02-1234-5679",
                "contact@nds.co.kr", "01", LocalDate.of(1998, 3, 2), LocalDate.of(2010, 1, 1), null,
                true, true);
        nds.addContact(CustomerContact.create("구매팀", "김철수", "02-1234-5680", "kim@nds.co.kr"));
        nds.addContact(CustomerContact.create("영업팀", "이영희", "02-1234-5681", "lee@nds.co.kr"));

        Customer acme = Customer.create("000002", "2208123456", "에이씨엠이 코퍼레이션", "ACME", TradeType.BUY,
                "박영수", null, "도매업", "전자부품", "13494",
                "경기도 성남시 분당구 판교로 200", null, "031-700-1000", null,
                "sales@acme.com", "01", LocalDate.of(2005, 7, 15), LocalDate.of(2018, 5, 1), null,
                true, false);
        acme.addContact(CustomerContact.create("자재부", "최민호", "031-700-1001", "choi@acme.com"));

        Customer oldVendor = Customer.create("000003", "3149876543", "구거래 상사", "구거래", TradeType.SALE,
                "정해종", null, "서비스업", "컨설팅", "48058",
                "부산광역시 해운대구 센텀로 99", null, "051-800-2000", null,
                null, "01", LocalDate.of(1999, 11, 1), LocalDate.of(2009, 2, 1), LocalDate.of(2021, 12, 31),
                false, false);

        customerRepository.save(nds);
        customerRepository.save(acme);
        customerRepository.save(oldVendor);
    }
}
