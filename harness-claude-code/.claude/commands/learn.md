---
description: 현재 세션에서 재사용 가능한 패턴을 추출해 인스팅트로 저장
argument-hint: "[패턴 한 줄 요약]"
---

# /learn — 세션 패턴을 인스팅트로 저장

지금 세션에서 해결한 비자명한 문제·발견한 관례를 Continuous Learning v2 인스팅트로 저장합니다.

## What to Extract

1. **오류 해결 패턴** — 어떤 오류였고, 근본 원인과 해결책은 무엇이었나
2. **디버깅 기법** — 효과 있었던 비자명한 진단 단계·도구 조합
3. **워크어라운드** — 라이브러리 특이점, API 제약, 버전 이슈
4. **프로젝트 관례** — 코드베이스에서 발견한 규칙, 아키텍처 결정

인자가 주어지면(`/learn "Grid는 mask 필수"`) 그 내용을 바로 인스팅트로 만듭니다.

## Output

`~/.local/share/ecc-homunculus/instincts/personal/<kebab-case-id>.md` 에 저장:

```yaml
---
id: <kebab-case-id>
trigger: "when <적용 상황>"
confidence: 0.5
domain: code-style | workflow | testing | debugging | architecture
source: "manual-learn"
created: <오늘 ISO 날짜>
---
## Action
<한 문장의 행동 지침>

## Evidence
- <오늘 날짜>: <이 세션에서의 근거>
```

## Rules

- 인스팅트는 원자적으로(행동 1개), 트리거는 구체적으로.
- 이미 같은 id가 있으면 confidence +0.05 하고 Evidence 줄을 추가.
- 저장 후 `/instinct-status` 로 확인 가능함을 안내.
- 관측 데이터를 일괄 분석하려면 `observer` 에이전트(Task 도구)를 제안.
