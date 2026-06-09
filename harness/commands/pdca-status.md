---
description: Show PDCA phase-by-phase status for all tracked features
---

# /pdca-status

추적 중인 모든 기능의 PDCA 단계별 상태를 표로 표시합니다.

## 사용법

```
/pdca-status
# 또는
/pdca status
```

## 실행 내용

1. `pdca-status` 도구를 `action=show`로 호출해 `.pdca-status.json`을 읽는다.
2. 각 기능의 단계 진행과 품질 게이트 점수를 표로 정리한다.

### 단계 완료 기준

| 단계 | 확인 위치 | 완료 기준 |
|------|----------|----------|
| Plan | `docs/pdca/01-plan/{feature}.plan.md` | 파일 존재 |
| Design | `docs/pdca/02-design/{feature}.design.md` | 파일 존재 |
| Do | 소스 코드 + `generatedFiles[]` | 코드 생성 |
| Check | `docs/pdca/03-check/{feature}-*.md` | L1~L4 게이트 점수 기록 |
| Iterate | `.pdca-status.json` → iterationCount | 반복 횟수 기록 |
| Report | `docs/pdca/04-report/{feature}.report.md` | 파일 존재 |

## 출력 예시

```
═══════════════════════════════════════════════════════════
 📊 PDCA Status
═══════════════════════════════════════════════════════════
 Feature      Plan Design Do  Check          Iter Report
 login-api    ✅   ✅     ✅  ✅ 92/95/93/90 -    ✅
 user-list    ✅   ✅     ✅  ⚠️ 88/90/85/90 2/3  ❌
 search       ✅   ❌     ❌  ❌             -    ❌
───────────────────────────────────────────────────────────
 완료 1 · 진행중 1 · 대기 1
 ⚠️ user-list: L3(테스트) 85% < 90% → /pdca iterate user-list
═══════════════════════════════════════════════════════════
```

## 아이콘

✅ 완료 · 🔄 진행중 · ⚠️ 완료(기준미달) · ❌ 미실행 · `-` 해당없음

상세 기준은 `@skills/pdca/SKILL.md` 참조.
