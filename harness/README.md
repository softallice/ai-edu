# AI-Edu OpenCode 하네스

ECC(everything-claude-code)의 `.opencode` 구성을 **OpenCode 전용**으로 충실히 포팅한 에이전트 하네스입니다.
멀티-티어 Anthropic 모델 대신 **로컬 Ollama `qwen2.5-coder:7b` 단일 모델**로 동작하도록 재구성했습니다.

> 환경 전제: WSL + Ollama + OpenCode + Java/Spring Boot + React (`../docs/1.환경설정.md` 참고)

## 빠른 시작

```bash
# 0) 사전 조건: Ollama 실행 + 모델 다운로드
ollama run qwen2.5-coder:7b          # 최초 1회 (다운로드 후 /exit)
ollama serve                          # 백그라운드 데몬 (보통 자동 실행)

# 1) 플러그인/도구 타입 의존성 설치 (선택: 빌드/타입체크용)
cd harness
npm install

# 2) 이 디렉터리에서 OpenCode 실행
opencode
```

OpenCode는 `opencode.json`을 읽어 모델·에이전트·커맨드·플러그인·MCP·스킬을 자동 로드합니다.
TypeScript 플러그인(`plugins/`)과 도구(`tools/`)는 OpenCode 런타임이 직접 실행하므로 별도 빌드 없이 동작합니다.

## 구성 개요

| 영역 | 위치 | 개수 | 설명 |
|------|------|------|------|
| 메인 설정 | `opencode.json` | 1 | 모델/프로바이더/에이전트/커맨드/MCP/스킬/권한 |
| 에이전트 | `prompts/agents/*.txt` | 25 (+`build`) | 각 전문 에이전트 시스템 프롬프트 |
| 커맨드 | `commands/*.md` | 35 | 슬래시 커맨드 템플릿 |
| 플러그인 | `plugins/ecc-hooks.ts` | 1 | 11개 이벤트 훅 + 7개 도구 등록 |
| 도구 | `tools/*.ts` | 7 | run-tests / check-coverage / security-audit / format-code / lint-check / git-summary / changed-files |
| 스킬 | `skills/*/SKILL.md` | 11 | instructions로 로드되는 도메인 지식 |
| 지침 | `instructions/INSTRUCTIONS.md`, `AGENTS.md`, `CONTRIBUTING.md` | 3 | 보안/코딩/테스트/git 규칙 |
| MCP | `opencode.json`의 `mcp` 블록 | 6 | context7 / playwright / memory / sequential-thinking / github / exa |

### 모델

모든 에이전트(planner, architect, code-reviewer, 언어별 reviewer 등)가 `ollama/qwen2.5-coder:7b` 하나로 통일되어 있습니다.

```json
"provider": {
  "ollama": {
    "npm": "@ai-sdk/openai-compatible",
    "options": { "baseURL": "http://localhost:11434/v1" },
    "models": { "qwen2.5-coder:7b": { "name": "Qwen2.5 Coder 7B (local)" } }
  }
},
"model": "ollama/qwen2.5-coder:7b"
```

### 주요 커맨드

`/plan` `/tdd` `/code-review` `/security` `/build-fix` `/e2e` `/refactor-clean` `/orchestrate`
`/go-review` `/go-test` `/go-build` `/rust-review` `/rust-test` `/rust-build`
`/harness-audit` `/loop-start` `/loop-status` `/quality-gate` `/model-route` `/security-scan`
`/learn` `/checkpoint` `/verify` `/eval` `/update-docs` `/update-codemaps` `/test-coverage`
`/skill-create` `/instinct-*` `/evolve` `/promote` `/projects` `/setup-pm`

### 플러그인 훅 (OpenCode 이벤트)

`file.edited`, `tool.execute.before`, `tool.execute.after`, `session.created`, `session.idle`,
`session.deleted`, `file.watcher.updated`, `todo.updated`, `shell.env`,
`experimental.session.compacting`, `permission.ask`

프리티어 자동 포맷·TypeScript 체크·console.log 경고·시크릿 검사·환경변수 주입·컨텍스트 압축 보존 등을 수행합니다.

```bash
# 훅 실행 강도 제어
export ECC_HOOK_PROFILE=standard            # minimal | standard | strict
export ECC_DISABLED_HOOKS="post:edit:format,post:edit:typecheck"
```

## PDCA 방법론 (nkit-claude-code에서 이식)

PowerBuilder 마이그레이션 프레임워크 `nkit-claude-code`의 PDCA 엔진을 **마이그레이션 비특화 제네릭 버전**으로 이식했습니다. 어떤 기능 개발/리팩터링/버그수정에도 적용 가능한 단계·게이트·반복 워크플로우입니다.

```
plan → design → do → check ──(게이트 전부 통과)──────────→ report
                         └─(미달)→ iterate → check ↺ (최대 3회) ─┘
```

| 단계 | PDCA | 담당 에이전트 | 산출물 |
|------|------|--------------|--------|
| plan | Plan | planner | `docs/pdca/01-plan/{feature}.plan.md` |
| design | Plan | architect | `docs/pdca/02-design/{feature}.design.md` |
| do | Do | build | 소스 코드 |
| check | Check | code-reviewer · security-reviewer · tdd-guide | `docs/pdca/03-check/{feature}-*.md` |
| iterate | Act | build-error-resolver · refactor-cleaner · tdd-guide | (수정 후 재검증) |
| report | Act | doc-updater | `docs/pdca/04-report/{feature}.report.md` |

**품질 게이트(순차)**: L1 코드품질 ≥80 · L2 설계일치 ≥90% · **L3 테스트·동작 ≥90% (CRITICAL)** · L4 빌드·런타임 ≥90%

**커맨드**
```bash
/pdca-full <feature> [--auto] [--skip-iterate] [--from <phase>]   # 전체 루프
/pdca <phase> <feature>     # 단일 단계 (plan/design/do/check/iterate/report)
/pdca-status                # 진행 상태 표
/pdca-next                  # 다음 권장 단계
```

**구성 요소**
- `skills/pdca/SKILL.md` — 방법론 정의(instructions로 자동 로드)
- `prompts/agents/pdca-orchestrator.txt` — 오케스트레이터(primary) 에이전트
- `config/pdca.config.json` — 단계·게이트 임계값·에이전트 매핑
- `tools/pdca-status.ts` — `.pdca-status.json` 상태 영속화 도구(플러그인에 연결)
- 압축 훅(`experimental.session.compacting`)이 `.pdca-status.json`의 PDCA 진행을 보존 → 로컬 7B 모델의 컨텍스트 제약 완화

> nkit 대비 의도적 제외: PB 파싱(`extract`/parse_pb.py), Nexacro/NDSERP 코드 생성, 단계별 opus/sonnet/haiku 모델 라우팅(→ 로컬 단일 모델로 통일), `/pdca-parallel`(다중 기능 병렬 — 로컬 7B 단일 모델에서는 단일 기능 흐름이 명확하여 제외).

자세한 적용 가이드는 `../docs/2.PDCA-방법론.md` 참조.

## ECC 원본 대비 변경점 (포팅 시 적용)

1. **모델 단일화**: `anthropic/claude-{opus,sonnet,haiku}-4-5` → 전부 `ollama/qwen2.5-coder:7b`. opus/sonnet/haiku 티어 라우팅 제거.
2. **프로바이더 추가**: 로컬 Ollama용 OpenAI 호환 `provider` 블록 신규 정의.
3. **커맨드 등록 보완**: 원본에서 `.md`만 있고 미등록이던 9개(`harness-audit`, `loop-start`, `loop-status`, `quality-gate`, `model-route`, `rust-review/test/build`, `security-scan`)를 `command`에 등록 → 26 → 35개.
4. **도구 연결 보완**: 원본은 `changed-files`만 플러그인에 연결돼 있던 것을, 7개 도구 전부 `tool` 맵에 연결.
5. **MCP 포팅**: 루트 `.mcp.json`의 6개 서버를 OpenCode `mcp` 스키마로 이식. `github`/`exa`는 토큰·네트워크가 필요해 기본 `enabled:false`.
6. **스킬 경로**: `skills.paths`를 `../skills` → `./skills`로 변경하고, instructions가 로드하는 11개 스킬을 하네스 내부로 복사(자기완결).

## 알려진 제약 (로컬 7B 환경)

- `qwen2.5-coder:7b`의 컨텍스트 윈도가 제한적이라, 대형 리팩터링/다중 파일 작업 시 컨텍스트 관리(`strategic-compact` 스킬)가 중요합니다.
- 플러그인 자동 포맷/타입체크 훅은 JS/TS 중심입니다. Java 포맷팅은 훅에 포함돼 있지 않습니다.
- `docs-lookup`(Context7)·`e2e-runner`(Playwright)는 해당 MCP가 활성화·설치돼 있어야 동작합니다.

자세한 Claude Code ↔ OpenCode 매핑은 `MIGRATION.md`를 참고하세요.
