---
name: pdca
description: PDCA(Plan-Do-Check-Act) 방법론으로 기능 개발/리팩터링/버그수정을 단계·게이트·반복 기반으로 진행할 때 사용. /pdca, /pdca-full, /pdca-status, /pdca-next 커맨드의 흐름 제어, 단계별 에이전트 매핑, 품질 게이트 기준, FAQ를 제공.
origin: nkit-pdca (generic port)
user-invocable: true
---

# PDCA Skill — 범용 개발 방법론

> nkit-claude-code의 PowerBuilder 마이그레이션 PDCA 엔진에서 **마이그레이션 특화 요소(PB 파싱·Nexacro·NDSERP 등)를 제거한 제네릭 버전**입니다.
> 본 하네스(로컬 Ollama 단일 모델)에서 어떤 기능 개발/리팩터링/버그수정에도 적용할 수 있는 단계·게이트·반복 워크플로우를 정의합니다.

## PDCA란

| 단계 | PDCA 매핑 | 목적 |
|------|----------|------|
| **plan** | Plan | 요구사항·범위·리스크 정의, 작업 분해 |
| **design** | Plan | 아키텍처/API/데이터/UI 설계 문서화 |
| **do** | Do | 설계대로 코드 구현 |
| **check** | Check | 품질 게이트(L1~L4) 검증 |
| **iterate** | Act | 게이트 미달 항목 자동 수정 후 재검증(반복) |
| **report** | Act | 완료 보고서 작성 + 상태 갱신 |

> 단계 별칭: `analyze`→plan, `implement`→do, `verify`→check, `act`→iterate

## 핵심 원칙 (Non-Negotiable)

1. **순서 강제**: `plan → design → do → check → iterate → report`. 단계 생략 금지.
2. **문서 의존성**: `design`은 plan 문서, `do`는 design 문서, `check`는 생성된 코드, `iterate`는 check 결과, `report`는 전 단계 문서를 전제로 한다.
3. **품질 게이트는 협상 불가**: 특히 **L3(테스트·동작 일치)는 CRITICAL** — 미통과 시 report로 진행 금지.
4. **상태 영속화**: 매 단계 종료 시 `.pdca-status.json`을 갱신한다(`pdca-status` 도구 사용).
5. **핸드오프**: 단계 결과는 `docs/pdca/`에 구조화된 마크다운으로 남겨 다음 단계가 읽도록 한다.

## 인자 (Arguments)

| 인자 | 설명 | 예시 |
|------|------|------|
| `plan [feature]` | 구현 계획 수립 | `/pdca plan login-api` |
| `design [feature]` | 아키텍처/API/UI 설계 | `/pdca design login-api` |
| `do [feature]` | 설계대로 코드 구현 | `/pdca do login-api` |
| `check [feature]` | 품질 게이트 4단계 검증 | `/pdca check login-api` |
| `iterate [feature]` | 게이트 미달 자동 수정·재검증 | `/pdca iterate login-api` |
| `report [feature]` | 완료 보고서 + 상태 갱신 | `/pdca report login-api` |
| `status` | 전체 진행 상태 표 | `/pdca status` |
| `next` | 다음 권장 단계 안내 | `/pdca next` |

## 단계별 상세

### 1️⃣ plan (Plan)
- **에이전트**: `planner`
- **할 일**: 요구사항 재정의 → 작업 분해 → 의존성/리스크 식별 → 복잡도 분류(simple/standard/complex) → 성공 기준 정의.
- **산출물**: `docs/pdca/01-plan/{feature}.plan.md`
- **종료 시**: `pdca-status` 도구로 `currentPhase=plan, done` 기록.

### 2️⃣ design (Plan)
- **에이전트**: `architect`
- **전제**: plan 문서 존재.
- **할 일**: 모듈/클래스 구조, API 시그니처, 데이터 모델, UI 구조, 에러 처리 전략 설계. 기존 코드 컨벤션 준수.
- **산출물**: `docs/pdca/02-design/{feature}.design.md`

### 3️⃣ do (Do)
- **에이전트**: `build`(주) — 언어별 작업 시 `java-*`, 프론트엔드 시 frontend 스킬 참조.
- **전제**: design 문서 존재.
- **할 일**: 설계대로 코드 작성. 작은 파일·불변성·입력검증·에러 처리(instructions/INSTRUCTIONS.md 준수). 가능하면 테스트도 함께.
- **산출물**: 실제 소스 코드 + `generatedFiles[]` 기록.

### 4️⃣ check (Check) — 품질 게이트 4단계
순차 검증. 앞 게이트 통과해야 다음 진행.

| 게이트 | 에이전트 | 기준 | 산출물 |
|--------|---------|------|--------|
| **L1 코드 품질** | `code-reviewer` + `security-reviewer` | ≥ 80점 | `03-check/{feature}-quality.md` |
| **L2 설계 일치** | `code-reviewer` | ≥ 90% | `03-check/{feature}-gap.md` |
| **L3 테스트·동작 일치** ⚠️CRITICAL | `tdd-guide` | ≥ 90% | `03-check/{feature}-test.md` |
| **L4 빌드·런타임** | `build`/`e2e-runner` | ≥ 90% | (빌드/E2E 로그) |

- **자동 액션**: 하나라도 미달 → `iterate` 권장. 전부 통과 → `report` 권장.
- 기준값은 `config/pdca.config.json`의 `qualityGates`에서 조정.

### 5️⃣ iterate (Act)
- **에이전트**: `build-error-resolver`(빌드/타입) + `refactor-cleaner`(품질) + `tdd-guide`(테스트)
- **전제**: check 결과 존재.
- **프로세스**: 이슈 우선순위화(Critical>High>Medium) → 수정 → **check 재실행** → 전 게이트 통과 또는 `maxIterations(3)` 도달까지 반복.
- **종료 조건**: 모든 게이트 통과 OR 3회 반복 도달(이때 미해결 항목을 report에 명시).

### 6️⃣ report (Act)
- **에이전트**: `doc-updater`
- **보고서 내용**: 개요 / 생성·변경 파일 / 품질 게이트 결과(L1~L4) / 주요 이슈와 해결 / 잔여 TODO / 다음 단계.
- **산출물**: `docs/pdca/04-report/{feature}.report.md`
- **MANDATORY**: `pdca-status` 도구로 `completed=true`, `completedAt`, `generatedFiles`, gate 점수 최종 기록.

## 전체 흐름 (/pdca-full)

`/pdca-full <feature>`는 `pdca-orchestrator` 에이전트가 위 단계를 순차 실행합니다.

```
plan → design → do → check ──(전부 통과)──────────────→ report
                         └─(미달)→ iterate → check ↺ (max 3) ─┘
```

옵션: `--auto`(단계 간 확인 생략), `--skip-iterate`, `--from <phase>`(중단 지점 재개).

## 상태 추적 (`pdca-status` 도구)

`.pdca-status.json` 스키마:
```json
{
  "version": "1.0.0",
  "updatedAt": "<iso8601>",
  "features": {
    "login-api": {
      "currentPhase": "check",
      "completed": false,
      "iterationCount": 1,
      "gates": { "L1_codeQuality": 92, "L2_designMatch": 95, "L3_testMatch": 88, "L4_runtime": 90 },
      "generatedFiles": ["src/.../LoginController.java"],
      "notes": "L3 미달 — 토큰 만료 케이스 테스트 누락"
    }
  }
}
```
- 조회: `pdca-status` 도구 `action=show`
- 갱신: `action=update` (feature, phase, gates, iterationCount, files, notes)

## 다음 단계 우선순위 (/pdca-next)

1. **iterate 대기**: check 완료 + 게이트 미달 → 최우선
2. **check 대기**: do 완료 + 미검증
3. **do 대기**: design 완료 + 미구현
4. **design 대기**: plan 완료 + 설계문서 없음
5. **신규 시작**: plan 없음

## 자연어 트리거

```
"login-api 기능 계획 세워줘"        → /pdca plan login-api
"설계 작성해줘"                      → /pdca design login-api
"구현해줘"                           → /pdca do login-api
"품질 검증해줘"                      → /pdca check login-api
"품질 미달분 자동으로 고쳐줘"        → /pdca iterate login-api
"완료 보고서 작성해줘"               → /pdca report login-api
"전체 PDCA 한 번에 돌려줘"           → /pdca-full login-api
```

## FAQ

- **Q. 작은 변경에도 6단계 다 돌려야 하나?** simple 등급(`config`의 taskClassification)이면 `light` 레벨로 design을 plan에 흡수하고 iterate를 생략할 수 있습니다. 단 check(L3)는 항상 수행.
- **Q. 게이트가 3회 반복해도 안 넘으면?** report에 미해결 항목과 원인을 명시하고 `completed=false`로 남깁니다. 묵시적 통과 처리 금지.
- **Q. 로컬 7B 모델 컨텍스트가 부족하면?** `strategic-compact` 스킬과 단계별 핸드오프 문서를 활용해 단계 간 컨텍스트를 압축 전달합니다.

## 관련 파일

- `config/pdca.config.json` — 단계·게이트·임계값 설정
- `prompts/agents/pdca-orchestrator.txt` — 오케스트레이터 프롬프트
- `commands/pdca*.md` — 커맨드 템플릿
- `tools/pdca-status.ts` — 상태 영속화 도구
- `instructions/INSTRUCTIONS.md` — 코딩/보안/테스트 규칙(품질 게이트 근거)
