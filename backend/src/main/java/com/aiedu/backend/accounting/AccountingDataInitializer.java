package com.aiedu.backend.accounting;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 교육용 회계 마스터 시드.
 *
 * <p>통화·계정과목·장부·세금그룹·세금·샘플 전표를 각각 빈 테이블에만 적재합니다.
 * 실행 순서 {@code @Order(26)} — 기존 시드 완료 후 마지막으로 실행됩니다.
 */
@Component
@Order(26)
public class AccountingDataInitializer implements CommandLineRunner {

    private final CurrencyRepository currencyRepository;
    private final AccountRepository accountRepository;
    private final JournalRepository journalRepository;
    private final TaxGroupRepository taxGroupRepository;
    private final TaxRepository taxRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final LedgerService ledgerService;

    /** 생성자 주입. */
    public AccountingDataInitializer(
            CurrencyRepository currencyRepository,
            AccountRepository accountRepository,
            JournalRepository journalRepository,
            TaxGroupRepository taxGroupRepository,
            TaxRepository taxRepository,
            JournalEntryRepository journalEntryRepository,
            LedgerService ledgerService) {
        this.currencyRepository = currencyRepository;
        this.accountRepository = accountRepository;
        this.journalRepository = journalRepository;
        this.taxGroupRepository = taxGroupRepository;
        this.taxRepository = taxRepository;
        this.journalEntryRepository = journalEntryRepository;
        this.ledgerService = ledgerService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedCurrencies();
        seedAccounts();
        seedJournals();
        seedTaxGroups();
        seedTaxes();
        seedSampleEntries();
    }

    // ── 통화 ────────────────────────────────────────────────────────────────

    /**
     * 통화 마스터를 적재합니다.
     *
     * <p>KRW(대한민국 원)와 USD(미국 달러)를 등록합니다.
     */
    private void seedCurrencies() {
        if (currencyRepository.count() > 0) {
            return;
        }
        currencyRepository.save(Currency.create("KRW", "대한민국 원", "₩", 2));
        currencyRepository.save(Currency.create("USD", "미국 달러", "$", 2));
    }

    // ── 계정과목 ─────────────────────────────────────────────────────────────

    /**
     * 계정과목 마스터를 적재합니다.
     *
     * <p>자산·부채·자본·수익·비용 유형의 기본 계정 10개를 등록합니다.
     */
    private void seedAccounts() {
        if (accountRepository.count() > 0) {
            return;
        }
        accountRepository.save(Account.create("101", "현금", AccountType.ASSET));
        accountRepository.save(Account.create("102", "보통예금", AccountType.ASSET));
        accountRepository.save(Account.create("108", "외상매출금", AccountType.ASSET));
        accountRepository.save(Account.create("135", "부가세대급금", AccountType.ASSET));
        accountRepository.save(Account.create("201", "외상매입금", AccountType.LIABILITY));
        accountRepository.save(Account.create("255", "부가세예수금", AccountType.LIABILITY));
        accountRepository.save(Account.create("301", "자본금", AccountType.EQUITY));
        accountRepository.save(Account.create("401", "상품매출", AccountType.INCOME));
        accountRepository.save(Account.create("501", "상품매출원가", AccountType.EXPENSE));
        accountRepository.save(Account.create("811", "복리후생비", AccountType.EXPENSE));
    }

    // ── 장부 ─────────────────────────────────────────────────────────────────

    /**
     * 장부 마스터를 적재합니다.
     *
     * <p>매출·매입·은행·현금·일반 장부 5개를 등록합니다.
     */
    private void seedJournals() {
        if (journalRepository.count() > 0) {
            return;
        }
        journalRepository.save(Journal.create("SALE", "매출장", JournalType.SALE, "SAJ"));
        journalRepository.save(Journal.create("PURCHASE", "매입장", JournalType.PURCHASE, "PUJ"));
        journalRepository.save(Journal.create("BANK", "은행", JournalType.BANK, "BNK"));
        journalRepository.save(Journal.create("CASH", "현금", JournalType.CASH, "CSH"));
        journalRepository.save(Journal.create("MISC", "일반전표", JournalType.GENERAL, "JE"));
    }

    // ── 세금 그룹 ─────────────────────────────────────────────────────────────

    /**
     * 세금 그룹 마스터를 적재합니다.
     *
     * <p>부가가치세(VAT) 그룹 1개를 등록합니다.
     */
    private void seedTaxGroups() {
        if (taxGroupRepository.count() > 0) {
            return;
        }
        taxGroupRepository.save(TaxGroup.create("VAT", "부가가치세"));
    }

    // ── 세금 ──────────────────────────────────────────────────────────────────

    /**
     * 세금 마스터를 적재합니다.
     *
     * <p>부가세10%(매출·매입), 영세율, 면세 4개를 등록합니다.
     */
    private void seedTaxes() {
        if (taxRepository.count() > 0) {
            return;
        }
        TaxGroup vatGroup = taxGroupRepository.findAll().get(0);
        taxRepository.save(Tax.create("V10", "부가세10%",
                TaxAmountType.PERCENT, 10.0, TaxUse.SALE, vatGroup));
        taxRepository.save(Tax.create("VP10", "부가세10%매입",
                TaxAmountType.PERCENT, 10.0, TaxUse.PURCHASE, vatGroup));
        taxRepository.save(Tax.create("ZERO", "영세율",
                TaxAmountType.PERCENT, 0.0, TaxUse.SALE, vatGroup));
        taxRepository.save(Tax.create("EXEMPT", "면세",
                TaxAmountType.PERCENT, 0.0, TaxUse.SALE, vatGroup));
    }

    // ── 샘플 전표 ──────────────────────────────────────────────────────────────

    /**
     * 샘플 분개전표를 적재합니다.
     *
     * <p>매출인식 전표(INV-2025-0001)와 복리후생비 지출 전표 2건을 생성합니다.
     */
    private void seedSampleEntries() {
        if (journalEntryRepository.count() > 0) {
            return;
        }

        // 매출인식: 외상매출금 1,100,000 / 상품매출 1,000,000 + 부가세예수금 100,000
        ledgerService.post(new LedgerService.PostCommand(
                "INV-2025-0001",
                null,
                null,
                "SALE",
                LocalDate.of(2025, 1, 10),
                List.of(
                        new LedgerService.PostLine(
                                "108", "외상매출금",
                                new BigDecimal("1100000"), BigDecimal.ZERO,
                                null, null),
                        new LedgerService.PostLine(
                                "401", "상품매출",
                                BigDecimal.ZERO, new BigDecimal("1000000"),
                                null, null),
                        new LedgerService.PostLine(
                                "255", "부가세예수금",
                                BigDecimal.ZERO, new BigDecimal("100000"),
                                null, null))));

        // 복리후생비: 복리후생비 150,000 / 현금 150,000
        ledgerService.post(new LedgerService.PostCommand(
                null,
                null,
                null,
                "CASH",
                LocalDate.of(2025, 1, 15),
                List.of(
                        new LedgerService.PostLine(
                                "811", "복리후생비",
                                new BigDecimal("150000"), BigDecimal.ZERO,
                                null, null),
                        new LedgerService.PostLine(
                                "101", "현금",
                                BigDecimal.ZERO, new BigDecimal("150000"),
                                null, null))));
    }
}
