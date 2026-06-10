---
description: Recommend the next PDCA action based on current status and priorities
---
# /pdca-next

현재 상태에서 해야 할 다음 PDCA 작업을 우선순위에 따라 안내합니다.

## 사용법

```
/pdca-next
# 또는
/pdca next
```

## 실행 내용

1. `pdca-status` 도구(`action=show`)로 각 기능의 현재 단계와 게이트 점수를 읽는다.
2. 아래 우선순위로 다음 명령을 제안한다.

## 우선순위 결정 기준

1. **iterate 대기** — check 완료 + 게이트 미달(특히 L3 < 90%): 최우선
2. **check 대기** — do 완료 + 미검증
3. **do 대기** — design 완료 + 미구현
4. **design 대기** — plan 완료 + 설계 문서 없음
5. **신규 시작** — plan 없음

## 출력 예시

```
📍 다음 단계 분석

🔴 즉시: user-list → L3(테스트) 85% < 90%
   → /pdca iterate user-list
🟡 다음: search → 설계 필요
   → /pdca design search
🟢 신규: report-page → 계획 필요
   → /pdca plan report-page
```

상세 기준은 `@skills/pdca/SKILL.md` 참조.
