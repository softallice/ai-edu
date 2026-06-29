package com.aiedu.backend.accounting;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * 전표(분개) 금액 산술 — 순수 함수. Spring 의존 없이 단위 테스트 가능.
 *
 * <p>원 소스: koerp ledger-math.ts. 동작 보존: 0/0 라인 제거, 차·대변 합산,
 * 원 단위 반올림 비교(소수 잔차 허용).
 */
public final class LedgerMath {

    private LedgerMath() {
    }

    /**
     * 분개 라인 금액 입력 레코드.
     *
     * @param debit  차변 금액(null 허용 — 0으로 처리)
     * @param credit 대변 금액(null 허용 — 0으로 처리)
     */
    public record LineAmount(BigDecimal debit, BigDecimal credit) {
        /** debit null 시 ZERO 반환. */
        public BigDecimal safeDebit() {
            return debit != null ? debit : BigDecimal.ZERO;
        }
        /** credit null 시 ZERO 반환. */
        public BigDecimal safeCredit() {
            return credit != null ? credit : BigDecimal.ZERO;
        }
    }

    /**
     * 차변·대변 합계와 균형 여부.
     *
     * @param debit    차변 합계
     * @param credit   대변 합계
     * @param balanced 원 단위 반올림 후 차변==대변이면 true
     */
    public record BalanceSummary(BigDecimal debit, BigDecimal credit, boolean balanced) {
    }

    /**
     * 차변 또는 대변이 0이 아닌 라인만 반환합니다.
     *
     * @param lines 입력 라인 목록
     * @return 0/0 라인이 제거된 목록
     */
    public static List<LineAmount> nonZeroLines(List<LineAmount> lines) {
        if (lines == null) return List.of();
        return lines.stream()
                .filter(l -> l.safeDebit().compareTo(BigDecimal.ZERO) != 0
                        || l.safeCredit().compareTo(BigDecimal.ZERO) != 0)
                .toList();
    }

    /**
     * 라인들의 차변·대변 합과 균형 여부를 계산합니다.
     *
     * <p>균형 판정은 원 단위 반올림 후 비교(소수 잔차 허용) — koerp Math.round 의미 보존.
     *
     * @param lines 입력 라인 목록
     * @return 차변합/대변합/균형 여부
     */
    public static BalanceSummary summarizeBalance(List<LineAmount> lines) {
        if (lines == null || lines.isEmpty()) {
            return new BalanceSummary(BigDecimal.ZERO, BigDecimal.ZERO, true);
        }
        BigDecimal debit = lines.stream()
                .map(LineAmount::safeDebit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal credit = lines.stream()
                .map(LineAmount::safeCredit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal roundedDebit = debit.setScale(0, RoundingMode.HALF_UP);
        BigDecimal roundedCredit = credit.setScale(0, RoundingMode.HALF_UP);
        boolean balanced = roundedDebit.compareTo(roundedCredit) == 0;
        return new BalanceSummary(debit, credit, balanced);
    }
}
