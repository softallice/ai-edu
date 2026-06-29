package com.aiedu.backend.accounting;

import com.aiedu.backend.accounting.dto.JournalEntryRequest;
import com.aiedu.backend.common.ResourceNotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 복식부기 분개전표 서비스.
 *
 * <p>핵심 메서드 {@link #post(PostCommand)} 는 차대변 균형 검증, 계정 조회, 장부 라우팅,
 * 전표명 채번을 순서대로 처리합니다.
 */
@Service
@Transactional(readOnly = true)
public class LedgerService {

    private final AccountRepository accountRepository;
    private final JournalRepository journalRepository;
    private final JournalEntryRepository journalEntryRepository;

    public LedgerService(AccountRepository accountRepository,
            JournalRepository journalRepository,
            JournalEntryRepository journalEntryRepository) {
        this.accountRepository = accountRepository;
        this.journalRepository = journalRepository;
        this.journalEntryRepository = journalEntryRepository;
    }

    // ─────────────────────── Command / Record ───────────────────────

    /**
     * 전표 라인 명세.
     *
     * @param code           계정 코드
     * @param name           적요
     * @param debit          차변 금액
     * @param credit         대변 금액
     * @param currencyCode   외화 코드(선택)
     * @param amountCurrency 외화 금액(선택)
     */
    public record PostLine(String code, String name, BigDecimal debit, BigDecimal credit,
            String currencyCode, BigDecimal amountCurrency) {
    }

    /**
     * 전표 생성 명령.
     *
     * @param ref         외부 참조 번호(선택)
     * @param sourceType  출처 유형(선택)
     * @param sourceId    출처 ID(선택)
     * @param journalCode 장부 코드(선택, 미지정 시 MISC)
     * @param date        전표 일자
     * @param lines       분개 라인
     */
    public record PostCommand(String ref, String sourceType, String sourceId,
            String journalCode, LocalDate date, List<PostLine> lines) {
    }

    // ─────────────────────── Core: post() ───────────────────────────

    /**
     * 분개 전표를 생성합니다.
     *
     * <ol>
     *   <li>0 라인 제거 → 빈 목록이면 예외</li>
     *   <li>차대변 균형 검증 → 불균형이면 예외</li>
     *   <li>계정 코드 조회 → 없는 코드 있으면 예외</li>
     *   <li>장부 라우팅(journalCode → MISC → null)</li>
     *   <li>전표명 채번</li>
     *   <li>전표 + 라인 생성 후 저장</li>
     * </ol>
     *
     * @param cmd 전표 생성 명령
     * @return 저장된 전표 엔티티
     */
    @Transactional
    public JournalEntry post(PostCommand cmd) {
        // ① 0라인 제거
        List<LedgerMath.LineAmount> amounts = cmd.lines().stream()
                .map(l -> new LedgerMath.LineAmount(l.debit(), l.credit()))
                .toList();
        List<LedgerMath.LineAmount> nonZero = LedgerMath.nonZeroLines(amounts);
        if (nonZero.isEmpty()) {
            throw new IllegalArgumentException("분개 라인이 없습니다");
        }

        // 0라인이 제거된 PostLine 목록 구성
        List<PostLine> lines = new ArrayList<>();
        for (int i = 0; i < cmd.lines().size(); i++) {
            LedgerMath.LineAmount amt = amounts.get(i);
            if (amt.safeDebit().compareTo(BigDecimal.ZERO) != 0
                    || amt.safeCredit().compareTo(BigDecimal.ZERO) != 0) {
                lines.add(cmd.lines().get(i));
            }
        }

        // ② 균형 검증
        LedgerMath.BalanceSummary summary = LedgerMath.summarizeBalance(nonZero);
        if (!summary.balanced()) {
            throw new IllegalArgumentException(
                    "분개 불균형: 차변 " + summary.debit() + " ≠ 대변 " + summary.credit());
        }

        // ③ 계정 조회
        Set<String> codes = lines.stream().map(PostLine::code).collect(Collectors.toSet());
        List<Account> accounts = accountRepository.findByCodeIn(codes);
        Map<String, Account> byCode = accounts.stream()
                .collect(Collectors.toMap(Account::getCode, a -> a));
        List<String> missing = codes.stream()
                .filter(c -> !byCode.containsKey(c))
                .sorted()
                .toList();
        if (!missing.isEmpty()) {
            throw new IllegalArgumentException("계정 없음: " + String.join(", ", missing));
        }

        // ④ 장부 라우팅
        String jCode = cmd.journalCode() != null ? cmd.journalCode() : "MISC";
        Journal journal = journalRepository.findByCode(jCode)
                .orElseGet(() -> journalRepository.findByCode("MISC").orElse(null));

        // ⑤ 전표명 채번
        String prefix = journal != null ? journal.getSequencePrefix() : "JE";
        String name = generateEntryName(prefix);

        // ⑥ 전표 + 라인 생성
        LocalDate entryDate = cmd.date() != null ? cmd.date() : LocalDate.now();
        JournalEntry entry = JournalEntry.create(name, entryDate, cmd.ref(), journal,
                cmd.sourceType(), cmd.sourceId());
        for (PostLine l : lines) {
            Account acc = byCode.get(l.code());
            BigDecimal debit = l.debit() != null ? l.debit() : BigDecimal.ZERO;
            BigDecimal credit = l.credit() != null ? l.credit() : BigDecimal.ZERO;
            JournalEntryLine line = JournalEntryLine.create(entry, acc, l.name(), debit, credit,
                    l.currencyCode(), l.amountCurrency());
            entry.addLine(line);
        }
        return journalEntryRepository.save(entry);
    }

    // ─────────────────────── Account CRUD ───────────────────────────

    /** 계정과목 목록 검색. */
    public List<Account> searchAccounts(String keyword, AccountType type, Boolean active) {
        Specification<Account> spec = Specification.allOf(
                AccountSpecifications.keyword(keyword),
                AccountSpecifications.typeEquals(type),
                AccountSpecifications.activeEquals(active));
        return accountRepository.findAll(spec, Sort.by("code"));
    }

    /** 계정과목 단건 조회. */
    public Account findAccount(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("계정과목을 찾을 수 없습니다. id=" + id));
    }

    /** 계정과목 등록. */
    @Transactional
    public Account createAccount(String code, String name, AccountType type) {
        if (accountRepository.existsByCode(code)) {
            throw new IllegalArgumentException("이미 존재하는 계정 코드입니다: " + code);
        }
        return accountRepository.save(Account.create(code, name, type));
    }

    /** 계정과목 수정(코드 불변). */
    @Transactional
    public Account updateAccount(Long id, String name, AccountType type, boolean active) {
        Account account = findAccount(id);
        account.update(name, type, active);
        return account;
    }

    /** 계정과목 삭제. */
    @Transactional
    public void deleteAccount(Long id) {
        accountRepository.delete(findAccount(id));
    }

    // ─────────────────────── Journal CRUD ───────────────────────────

    /** 장부 목록 조회. */
    public List<Journal> listJournals() {
        return journalRepository.findAll(Sort.by("code"));
    }

    /** 장부 단건 조회. */
    public Journal findJournal(Long id) {
        return journalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("장부를 찾을 수 없습니다. id=" + id));
    }

    /** 장부 등록. */
    @Transactional
    public Journal createJournal(String code, String name, JournalType type, String sequencePrefix) {
        if (journalRepository.existsByCode(code)) {
            throw new IllegalArgumentException("이미 존재하는 장부 코드입니다: " + code);
        }
        return journalRepository.save(Journal.create(code, name, type, sequencePrefix));
    }

    /** 장부 수정(코드 불변). */
    @Transactional
    public Journal updateJournal(Long id, String name, JournalType type, String sequencePrefix, boolean active) {
        Journal journal = findJournal(id);
        journal.update(name, type, sequencePrefix, active);
        return journal;
    }

    // ─────────────────────── JournalEntry CRUD ──────────────────────

    /** 분개전표 목록 검색. */
    public List<JournalEntry> searchEntries(String keyword, String journalCode,
            LocalDate dateFrom, LocalDate dateTo) {
        Specification<JournalEntry> spec = Specification.allOf(
                JournalEntrySpecifications.keyword(keyword),
                JournalEntrySpecifications.journalCodeEquals(journalCode),
                JournalEntrySpecifications.dateFrom(dateFrom),
                JournalEntrySpecifications.dateTo(dateTo));
        return journalEntryRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "entryDate"));
    }

    /** 분개전표 단건 조회. */
    public JournalEntry findEntry(Long id) {
        return journalEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("분개전표를 찾을 수 없습니다. id=" + id));
    }

    /** 수동 분개전표 생성(JournalEntryRequest → PostCommand 변환). */
    @Transactional
    public JournalEntry createManualEntry(JournalEntryRequest req) {
        List<PostLine> postLines = req.lines().stream()
                .map(l -> new PostLine(l.accountCode(), l.name(),
                        l.debit() != null ? l.debit() : BigDecimal.ZERO,
                        l.credit() != null ? l.credit() : BigDecimal.ZERO,
                        l.currencyCode(), l.amountCurrency()))
                .toList();
        PostCommand cmd = new PostCommand(req.ref(), null, null, req.journalCode(), req.date(), postLines);
        return post(cmd);
    }

    /** 분개전표 삭제. */
    @Transactional
    public void deleteEntry(Long id) {
        journalEntryRepository.delete(findEntry(id));
    }

    // ─────────────────────── Private ────────────────────────────────

    /**
     * 전표명 채번: {prefix}-{YYYY}-{NNNN}.
     * countByNameStartingWith 기반으로 시작 후 existsByName 충돌 회피.
     */
    private String generateEntryName(String prefix) {
        int year = Year.now().getValue();
        String startsWith = prefix + "-" + year + "-";
        long seq = journalEntryRepository.countByNameStartingWith(startsWith) + 1;
        String name = startsWith + String.format("%04d", seq);
        while (journalEntryRepository.existsByName(name)) {
            seq++;
            name = startsWith + String.format("%04d", seq);
        }
        return name;
    }
}
