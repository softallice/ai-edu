---
description: Execute the full PDCA loop (plan→design→do→check→iterate→report) for a feature
---

# PDCA Full Command

기능 하나에 대해 전체 PDCA 루프를 순차 실행합니다. `pdca-orchestrator` 에이전트가 각 단계를 전문 에이전트에 위임합니다.

## 사용법

```
/pdca-full <feature> [--auto] [--skip-iterate] [--from <phase>]
```

- `--auto`: 단계 간 사용자 확인 없이 진행
- `--skip-iterate`: 게이트 미달이어도 iterate 생략
- `--from <phase>`: 중단 지점부터 재개

## 실행 흐름

```
plan → design → do → check ──(전부 통과)─────────────→ report
                         └─(미달)→ iterate → check ↺ (max 3) ─┘
```

## 규칙

1. 각 단계 전에 전제 문서를 확인하고, 없으면 해당 단계를 먼저 수행한다.
2. `check` 후 품질 게이트(L1~L4) 결과로 분기한다. L3(테스트·동작)는 CRITICAL.
3. 게이트 미달 시 `iterate`→`check`를 `maxIterations(3)`까지 반복한다. 3회 후에도 미달이면 report에 잔여 이슈를 명시하고 `completed=false`로 둔다.
4. 매 단계 종료 시 `pdca-status` 도구로 상태를 갱신한다.
5. 종료 시 요약(실행 단계, 반복 횟수, 최종 게이트 점수, 생성 파일, 완료 여부)을 출력한다.

상세 기준은 `@skills/pdca/SKILL.md`, `config/pdca.config.json` 참조.

작업 대상: $ARGUMENTS
