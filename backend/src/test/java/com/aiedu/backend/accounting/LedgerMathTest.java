package com.aiedu.backend.accounting;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * LedgerMath 단위 테스트 — Spring 컨텍스트 없이 순수 JUnit 5 실행.
 *
 * <p>koerp ledger-math.ts 이식 시 동작 보존 검증.
 */
class LedgerMathTest {

    // ── nonZeroLines ──────────────────────────────────────────────

    @Test
    void nonZeroLines_차변이_있는_라인은_포함된다() {
        // Arrange
        var lines = List.of(
                new LedgerMath.LineAmount(new BigDecimal("1000"), BigDecimal.ZERO),
                new LedgerMath.LineAmount(BigDecimal.ZERO, BigDecimal.ZERO));
        // Act
        var result = LedgerMath.nonZeroLines(lines);
        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).debit()).isEqualByComparingTo("1000");
    }

    @Test
    void nonZeroLines_대변이_있는_라인은_포함된다() {
        var lines = List.of(
                new LedgerMath.LineAmount(BigDecimal.ZERO, new BigDecimal("500")),
                new LedgerMath.LineAmount(BigDecimal.ZERO, BigDecimal.ZERO));
        var result = LedgerMath.nonZeroLines(lines);
        assertThat(result).hasSize(1);
    }

    @Test
    void nonZeroLines_차변대변_모두_0인_라인은_제거된다() {
        var lines = List.of(
                new LedgerMath.LineAmount(BigDecimal.ZERO, BigDecimal.ZERO),
                new LedgerMath.LineAmount(null, null));
        var result = LedgerMath.nonZeroLines(lines);
        assertThat(result).isEmpty();
    }

    @Test
    void nonZeroLines_빈_목록은_빈_목록_반환() {
        var result = LedgerMath.nonZeroLines(List.of());
        assertThat(result).isEmpty();
    }

    // ── summarizeBalance ──────────────────────────────────────────

    @Test
    void summarizeBalance_차변합_대변합_같으면_balanced_true() {
        var lines = List.of(
                new LedgerMath.LineAmount(new BigDecimal("1100000"), BigDecimal.ZERO),
                new LedgerMath.LineAmount(BigDecimal.ZERO, new BigDecimal("1000000")),
                new LedgerMath.LineAmount(BigDecimal.ZERO, new BigDecimal("100000")));
        var summary = LedgerMath.summarizeBalance(lines);
        assertThat(summary.balanced()).isTrue();
        assertThat(summary.debit()).isEqualByComparingTo("1100000");
        assertThat(summary.credit()).isEqualByComparingTo("1100000");
    }

    @Test
    void summarizeBalance_차변합_대변합_다르면_balanced_false() {
        var lines = List.of(
                new LedgerMath.LineAmount(new BigDecimal("1000"), BigDecimal.ZERO),
                new LedgerMath.LineAmount(BigDecimal.ZERO, new BigDecimal("999")));
        var summary = LedgerMath.summarizeBalance(lines);
        assertThat(summary.balanced()).isFalse();
    }

    @Test
    void summarizeBalance_소수_잔차가_원_미만이면_반올림_후_balanced_true() {
        // 0.4원 차이 → 반올림 후 동일 → balanced
        var lines = List.of(
                new LedgerMath.LineAmount(new BigDecimal("1000.4"), BigDecimal.ZERO),
                new LedgerMath.LineAmount(BigDecimal.ZERO, new BigDecimal("1000.0")));
        var summary = LedgerMath.summarizeBalance(lines);
        assertThat(summary.balanced()).isTrue();
    }

    @Test
    void summarizeBalance_소수_잔차가_1원_이상이면_balanced_false() {
        // 1.0원 차이 → 반올림 후 불일치 → not balanced
        var lines = List.of(
                new LedgerMath.LineAmount(new BigDecimal("1001.0"), BigDecimal.ZERO),
                new LedgerMath.LineAmount(BigDecimal.ZERO, new BigDecimal("1000.0")));
        var summary = LedgerMath.summarizeBalance(lines);
        assertThat(summary.balanced()).isFalse();
    }

    @Test
    void summarizeBalance_빈_목록은_balanced_true_합은_0() {
        var summary = LedgerMath.summarizeBalance(List.of());
        assertThat(summary.balanced()).isTrue();
        assertThat(summary.debit()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(summary.credit()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void summarizeBalance_null_금액은_0으로_처리된다() {
        var lines = List.of(
                new LedgerMath.LineAmount(new BigDecimal("500"), null),
                new LedgerMath.LineAmount(null, new BigDecimal("500")));
        var summary = LedgerMath.summarizeBalance(lines);
        assertThat(summary.balanced()).isTrue();
    }
}
