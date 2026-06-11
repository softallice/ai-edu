# ai-edu Claude Code 하네스

이 디렉터리는 ai-edu OpenCode 하네스(`../harness`)를 **Claude Code 네이티브**로 포팅한 설정입니다.
멀티-티어 Claude 모델(opus/sonnet/haiku)을 복원하여, 에이전트·커맨드·스킬·컨벤션·PDCA를 Claude Code에서 그대로 사용합니다.

> 사용: 이 폴더에서 `claude` 실행 → `.claude/`(agents·commands·skills·settings)·`CLAUDE.md`·`.mcp.json` 가 자동 로드됩니다.
> 메인(기본) 에이전트는 아래의 **build 역할**로 동작하고, 전문 작업은 서브에이전트에 위임합니다.

## 핵심 원칙

1. **Plan Before Execute** — 복잡한 기능은 `planner`로 계획 후 사용자 승인을 받고 구현.
2. **Test-Driven** — 테스트 우선(RED→GREEN→REFACTOR), 커버리지 80%+.
3. **Security-First** — 입력 검증, 시크릿 하드코딩 금지, 민감 코드는 `security-reviewer`.
4. **Immutability** — 새 객체 반환, 원본 변경 금지.
5. **작은 파일·작은 함수** — 200~400줄 권장(800 최대), 함수 <50줄, 중첩 ≤4.

## 메인(build) 에이전트 역할

일반 개발 작업의 1차 수행자입니다. 코드 작성/수정 후에는 곧바로 적절한 서브에이전트로 검증을 위임하세요.

- 복잡한 기능 요청 → `planner`(계획) → 승인 → 구현
- 코드 작성/수정 직후 → `code-reviewer`(품질·보안)
- 신규 기능·버그 → `tdd-guide`(테스트 우선)
- 아키텍처 결정 → `architect`
- 빌드/타입 오류 → 언어별 `*-build-resolver`
- 보안 민감 코드 → `security-reviewer`

> **위임 규칙**: 서브에이전트는 메인 컨텍스트의 스킬·컨벤션을 자동 상속하지 않습니다.
> Task 로 위임할 때 아래 [에이전트↔스킬 매핑](#에이전트스킬-매핑)의 관련 스킬 핵심 규칙(또는
> 활성 컨벤션 팩 요점)을 프롬프트에 요약해 전달하세요.

## 서브에이전트 (모델 티어)

| 에이전트 | 모델 | 용도 |
|----------|------|------|
| planner · architect · security-reviewer · pdca-orchestrator | **opus** | 계획·설계·보안·오케스트레이션 |
| code-reviewer · tdd-guide · java-reviewer · java-build-resolver · build-error-resolver · e2e-runner · refactor-cleaner · database-reviewer · harness-optimizer · loop-operator | **sonnet** | 구현·리뷰·수정 |
| doc-updater · docs-lookup · observer | **haiku** | 문서·조회·관측 분석(경량) |

언어별 reviewer/resolver는 교육 스택(React-TS + Spring Boot)에 맞춰 **java**만 유지합니다(범용 코드는 code-reviewer/build-error-resolver 담당). 전체 정의는 `.claude/agents/*.md`.

## 슬래시 커맨드

`/plan` `/tdd` `/code-review` `/security` `/build-fix` `/e2e` `/refactor-clean` `/orchestrate`
`/verify` `/checkpoint` `/learn` `/eval` `/quality-gate` `/update-docs` `/test-coverage`
`/pdca-full` `/pdca` `/pdca-status` `/pdca-next` · `/apply-convention`
학습: `/learn` `/instinct-status` `/evolve` `/instinct-export` `/instinct-import`
전체는 `/help` 또는 `.claude/commands/` 참고.

## 학습 (Continuous Learning v2 — ECC 이식)

도구 사용은 observe 훅이 자동 관측합니다. 비자명한 문제를 해결했으면 `/learn` 으로
인스팅트를 저장하고, 관측이 쌓이면 `observer` 에이전트로 일괄 분석하세요.
`/instinct-status` 로 현황 확인, 한 도메인에 인스팅트가 모이면 `/evolve` 로 스킬 초안을 만듭니다.

## PDCA 방법론

품질 게이트 기반 개발 루프입니다(`pdca-orchestrator` 에이전트 + `config/pdca.config.json`).

```
plan → design → do → check ──(게이트 전부 통과)──→ report
                       └─(미달)→ iterate → check ↺ (최대 3회)
```

- L1 코드품질 ≥80 · L2 설계일치 ≥90% · **L3 테스트·동작 ≥90%(CRITICAL)** · L4 빌드·런타임 ≥90%
- 실행: `/pdca-full <기능>` (전체) · `/pdca <단계> <기능>` (단일) · `/pdca-status` · `/pdca-next`

## 사이트별 컨벤션

`conventions/` 의 팩을 실습 레포에 overlay로 적용합니다(common은 항상 포함).

```bash
node scripts/apply-convention.cjs <레포> react-typescript      # 프론트(TanStack/shadcn)
node scripts/apply-convention.cjs <레포> spring-boot           # 백엔드(Spring Boot REST)
node scripts/apply-convention.cjs <레포> --profile react-spring # 풀스택
```

팩: `common` · `react-typescript` · `spring-boot` · `nexacro` · `egov-backend`. 프로파일은 `conventions/profiles.json`.

## 스킬

`.claude/skills/` 의 스킬이 작업 맥락에 따라 자동 활성화됩니다: tdd-workflow · security-review · coding-standards · frontend-patterns · backend-patterns · api-design · e2e-testing · verification-loop · strategic-compact · eval-harness · pdca · frontend-slides · continuous-learning-v2.

### 에이전트↔스킬 매핑

서브에이전트 위임 시 함께 전달할(또는 에이전트가 Skill 도구·Read 로 참조할) 스킬:

| 에이전트 | 관련 스킬 |
|----------|----------|
| pdca-orchestrator · planner | pdca (단계·게이트·상태 스키마) |
| architect | api-design · backend-patterns/frontend-patterns |
| code-reviewer · refactor-cleaner | coding-standards · security-review |
| security-reviewer | security-review |
| tdd-guide | tdd-workflow · verification-loop |
| e2e-runner | e2e-testing |
| java-reviewer · java-build-resolver | backend-patterns (Spring Boot) |
| observer | continuous-learning-v2 (인스팅트 형식·저장 경로) |
| doc-updater · docs-lookup | coding-standards |

## 보안·품질 게이트 (커밋 전 필수)

- [ ] 하드코딩 시크릿 없음(→ 환경변수) · 외부 입력 검증 · SQL 파라미터 바인딩
- [ ] `console.log`·디버그 로그 제거 · 에러를 조용히 삼키지 않음
- [ ] 테스트 동반(80%+) · 빌드/린트/테스트 통과
- git hook 우회(`--no-verify`)는 PreToolUse 훅이 차단합니다.

---

전 사이트 공통 컨벤션을 항상 적용합니다:

@conventions/common/CONVENTION.md
