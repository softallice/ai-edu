---
name: continuous-learning-v2
description: Instinct-based learning system — observes sessions via hooks, stores atomic "instincts" with confidence scoring, and evolves mature instincts into skills/commands. Activate when saving session patterns (/learn), reviewing learned behavior (/instinct-status), or clustering instincts into reusable assets (/evolve).
origin: ECC (everything-claude-code) — 교육 하네스용 단순화 포팅
---

# Continuous Learning v2 (교육 하네스판)

세션에서 발견한 패턴을 **인스팅트(instinct)** — confidence 점수가 붙은 작은 학습 단위 — 로
저장하고, 성숙한 인스팅트를 스킬/커맨드로 **진화**시키는 학습 시스템입니다.

> ECC 원본 v2.1을 교육용으로 단순화한 포팅입니다. 차이점:
> 백그라운드 옵저버 데몬 없음(observer 에이전트를 수동 호출), 프로젝트 스코프 대신 전역 저장.

## 구성 요소

| 구성 | 위치 | 역할 |
|------|------|------|
| 관측 훅 | `.claude/hooks/observe.js` (PostToolUse) | 도구 사용을 observations.jsonl에 기록 (시크릿 자동 마스킹) |
| 인스팅트 CLI | `scripts/instinct-cli.py` | status/evolve/export/import 엔진 (Python 표준 라이브러리만 사용) |
| observer 에이전트 | `.claude/agents/observer.md` | 관측 데이터 분석 → 인스팅트 파일 생성 (haiku) |
| 커맨드 | `/learn` `/instinct-status` `/evolve` `/instinct-export` `/instinct-import` | 사용자 인터페이스 |

## 저장소 구조

```
${XDG_DATA_HOME:-~/.local/share}/ecc-homunculus/
├── observations.jsonl     # 도구 사용 관측 (훅이 자동 기록, 10MB 회전)
├── instincts/
│   ├── personal/          # 학습된 인스팅트 (.md, YAML frontmatter)
│   └── inherited/         # 큐레이션 인스팅트 (가져온 것)
└── evolved/               # /evolve 가 생성한 스킬/커맨드 초안
```

## 인스팅트 형식

```yaml
---
id: prefer-early-return
trigger: "when writing conditional logic"
confidence: 0.7        # 0.3 잠정 → 0.7 강함 → 0.9 거의 확실
domain: "code-style"
source: "session-observation"
---
## Action
중첩 조건문 대신 조기 반환(early return)을 사용한다.

## Evidence
- 2026-06-11: 리뷰에서 3회 지적됨
```

## 워크플로우

```
세션 작업 → observe.js (자동 기록)
              ↓
/learn      → 지금 세션의 패턴을 인스팅트로 즉시 저장 (LLM 판단)
observer    → observations.jsonl 일괄 분석 → 인스팅트 생성 (Task 도구로 호출)
              ↓
/instinct-status → confidence 막대로 현황 확인
/evolve          → 유사 인스팅트 클러스터링 → 스킬/커맨드 초안 생성
/instinct-export → 팀 공유용 JSON 내보내기 → /instinct-import 로 가져오기
```

## When to Use

- 세션에서 반복 패턴·실수 교정·프로젝트 관례를 발견했을 때 → `/learn`
- 관측 데이터가 충분히 쌓였을 때(수십 회 도구 호출) → observer 에이전트 호출
- 학습 현황 점검 → `/instinct-status`
- 인스팅트 5개 이상 한 도메인에 모였을 때 → `/evolve`
