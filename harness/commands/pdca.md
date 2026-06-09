---
description: Run a single PDCA phase (plan/design/do/check/iterate/report) or status/next
---

# PDCA Command

단일 PDCA 단계를 실행합니다. `@skills/pdca/SKILL.md`의 흐름·게이트·에이전트 매핑을 따릅니다.

## 사용법

```
/pdca <phase> [feature]
```

- `phase`: `plan` | `design` | `do` | `check` | `iterate` | `report` | `status` | `next`
- 별칭: `analyze`=plan, `implement`=do, `verify`=check, `act`=iterate

## 실행 규칙

1. **전제 문서 확인**: 해당 단계의 선행 산출물이 없으면 중단하고 선행 단계를 먼저 안내한다.
   - design ← plan / do ← design / check ← 코드 / iterate ← check / report ← 전 단계
2. 단계별로 매핑된 전문 에이전트를 호출한다 (plan→planner, design→architect, do→build, check→code-reviewer·security-reviewer·tdd-guide, iterate→build-error-resolver·refactor-cleaner·tdd-guide, report→doc-updater).
3. 산출물을 `docs/pdca/`의 규정 경로에 기록한다.
4. **종료 시 `pdca-status` 도구로 상태를 갱신**한다 (currentPhase, gates, iterationCount, generatedFiles).
5. `check`는 품질 게이트 4단계(L1 코드품질≥80, L2 설계일치≥90%, L3 테스트·동작≥90% CRITICAL, L4 빌드·런타임≥90%)를 순차 검증하고, 미달 시 `iterate`를 권장한다.

작업 대상: $ARGUMENTS
