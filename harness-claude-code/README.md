# ai-edu Claude Code 하네스 (harness-claude-code)

ai-edu의 **OpenCode 하네스(`../harness`)를 Claude Code 네이티브 포맷으로 포팅**한 설정입니다.
동일한 에이전트·커맨드·스킬·컨벤션·PDCA를 제공하되, **멀티-티어 Claude 모델(opus/sonnet/haiku)** 을 복원했습니다.

> `harness/`(OpenCode, 로컬 Ollama 단일 모델)와 **자매 관계**입니다. 같은 워크플로우를 Claude Code에서 쓰고 싶을 때 이 폴더를 사용하세요.

## 사전 준비

| 도구 | 확인 |
|------|------|
| Claude Code CLI | `claude --version` |
| Node.js ≥18 | `node -v` (훅 스크립트용) |
| Anthropic API 키 | `echo $ANTHROPIC_API_KEY` (티어 모델은 클라우드) |

## 실행 (교육 — 하네스 폴더에서)

```bash
cd harness-claude-code
claude
```

Claude Code가 이 폴더의 `.claude/`(agents·commands·skills·settings·hooks) · `CLAUDE.md` · `.mcp.json` 를 자동 로드합니다.

## 실무 적용 (전역 설치)

교육 모드는 하네스 폴더 안에서만 동작합니다. **실무 레포에서 쓰려면 전역 설치**하세요.

```bash
# 1) 전역 설치: ~/.claude 에 에이전트/커맨드/스킬/훅/컨벤션 설치
#    기존 ~/.claude/settings.json 은 백업 후 병합(덮어쓰지 않음), 매니페스트로 추적
./install.sh

# 2) 실무 레포에 사이트 컨벤션 overlay 생성 (전역 설치본 참조 — 하네스 위치와 무관)
node scripts/apply-convention.cjs ~/work/사이트레포 --from-home nexacro egov-backend
node scripts/apply-convention.cjs ~/work/포털레포  --from-home --profile react-spring

# 3) 실무 레포에서 실행 — 하네스 전체 + 해당 사이트 컨벤션 적용
cd ~/work/사이트레포 && claude

# 업데이트: 하네스 git pull 후 ./install.sh 재실행 (매니페스트 기준 갱신)
# 제거:     ./install.sh --uninstall  (사용자 자체 설정·백업본은 보존)
```

특정 프로젝트에만 설치하려면(전역 오염 없이): `./install.sh --project <레포>` — 해당 레포의 `.claude/`로 복사됩니다.

| 모드 | 적용 범위 | 적합한 경우 |
|------|----------|------------|
| 교육 (폴더 내 실행) | harness-claude-code 안에서만 | 수업·실습 |
| 전역 설치 | 모든 프로젝트 | 실무 표준 환경 |
| 프로젝트 설치 | 해당 레포만 | 팀 공용 머신, 파일럿 |

- 기본 모델: `sonnet` (`.claude/settings.json`) · 메인 에이전트는 CLAUDE.md의 **build 역할**
- 커맨드: `/help` 또는 `/plan` `/tdd` `/code-review` `/pdca-full` … (`.claude/commands/`)
- 서브에이전트 위임: Task 도구로 `planner`/`code-reviewer` 등 호출

## 구성

```
harness-claude-code/
├─ CLAUDE.md                  # 메인 지침 (build 역할·원칙·티어·PDCA·컨벤션)
├─ .mcp.json                  # MCP 서버 (context7·playwright·memory·sequential-thinking)
├─ .claude/
│  ├─ settings.json           # 모델·권한·훅
│  ├─ agents/*.md (17)        # 서브에이전트 (frontmatter: name/description/model/tools)
│  ├─ commands/*.md (29)      # 슬래시 커맨드
│  ├─ skills/*/SKILL.md (13)  # 도메인 스킬 (자동 활성화)
│  └─ hooks/*.js              # PreToolUse/PostToolUse 훅
├─ conventions/               # 컨벤션 팩 5종 + profiles + 생성기
├─ config/                    # pdca.config.json 등
└─ scripts/
   ├─ apply-convention.cjs        # 컨벤션 overlay 생성기
   └─ generate-from-opencode.cjs  # ../harness → 이 하네스 변환기(재생성용)
```

## 모델 티어링 (원본 ECC 방식 복원)

| 티어 | 에이전트 |
|------|----------|
| **opus** | planner · architect · security-reviewer · pdca-orchestrator |
| **sonnet** | code-reviewer · tdd-guide · java-reviewer/java-build-resolver · build-error-resolver · e2e-runner · refactor-cleaner · database-reviewer · harness-optimizer · loop-operator (+ 기본 모델) |
| **haiku** | doc-updater · docs-lookup · observer |

기본 모델은 `.claude/settings.json`의 `"model": "sonnet"`. 비용을 더 줄이려면 haiku로 낮추거나, 에이전트별 `model:` frontmatter를 조정하세요.

## OpenCode 하네스 대비 매핑

| 영역 | OpenCode(`harness/`) | Claude Code(`harness-claude-code/`) |
|------|----------------------|--------------------------------------|
| 모델 | 단일 `ollama/qwen2.5-coder:7b` | **opus/sonnet/haiku 티어** |
| 에이전트 | `opencode.json` `agent{}` + `prompts/*.txt` | `.claude/agents/*.md` (frontmatter+본문) |
| 커맨드 | `opencode.json` `command{}` + `commands/*.md` | `.claude/commands/*.md` |
| 스킬 | `instructions` 배열로 로드 | `.claude/skills/` 자동 활성화 |
| 훅 | TS 플러그인(`plugins/ecc-hooks.ts`, 11 이벤트) | `.claude/settings.json` 훅 + `.claude/hooks/*.js` |
| 지침 | `AGENTS.md`·`INSTRUCTIONS.md` | `CLAUDE.md` (+ `@conventions/common` import) |
| MCP | `opencode.json` `mcp{}` | `.mcp.json` |

## 훅 (settings.json) — ECC 이식 v2

| 이벤트 | 훅 | 동작 |
|--------|-----|------|
| PreToolUse(Bash) | guard-bash.js | `--no-verify`·광역 `rm -rf /` 차단(플래그 변형 포함) |
| PreToolUse(Bash) | commit-quality.js | `git commit` 전 스테이징 검사 — 시크릿/debugger는 **차단**, console.log/메시지 형식은 경고 |
| PreToolUse(Write\|Edit\|MultiEdit) | config-protection.js | 린터/포매터 설정 약화 차단 (최초 생성은 허용) |
| PreToolUse(Write\|Edit\|MultiEdit) | suggest-compact.js | 편집 50회+25회 간격으로 전략적 `/compact` 제안 |
| PostToolUse(Edit\|Write\|MultiEdit) | post-edit-accumulator.js | 편집 파일 경로를 세션 임시 파일에 누적 |
| PostToolUse(*) | observe.js (async) | CL-v2 관측 캡처 (시크릿 마스킹, 10MB 회전) |
| Stop | stop-format-typecheck.js | 누적 파일 **일괄** prettier 포맷 + `tsc --noEmit` (편집마다 돌리는 것보다 빠름) |
| Stop | check-console-log.js | git 변경 파일의 console.log 잔존 경고 |

훅은 `node`로 실행되는 자기완결 스크립트입니다(외부 의존성 없음 — ECC 원본의 플러그인 경로 해석/래퍼 계층은 제거하고 핵심 로직만 이식).
`settings.json`의 `deny: Bash(rm -rf /:*)`는 훅과 같은 일을 하는 **의도된 이중 방어**입니다(훅이 못 도는 환경 대비).

## Continuous Learning v2 (ECC 이식)

세션 패턴을 confidence 점수가 붙은 **인스팅트**로 축적하고 스킬로 진화시키는 학습 시스템입니다.

```
작업 → observe.js(자동 관측) → /learn(수동 저장) 또는 observer 에이전트(일괄 분석)
     → /instinct-status(현황) → /evolve(클러스터링 → 스킬 초안) → /instinct-export·import(팀 공유)
```

- 저장소: `${XDG_DATA_HOME:-~/.local/share}/ecc-homunculus/` (엔진: `.claude/skills/continuous-learning-v2/scripts/instinct-cli.py`, Python 표준 라이브러리만 사용)
- ECC 원본 대비 단순화: 백그라운드 옵저버 데몬 없음(온디맨드 observer 에이전트), 프로젝트 스코프 대신 전역 저장
- 관측 끄기: `HARNESS_SKIP_OBSERVE=1`

## MCP

기본 활성: `context7`(문서) · `playwright`(E2E) · `memory` · `sequential-thinking`.
원본에서 비활성이던 `github`·`exa`는 토큰/네트워크가 필요하여 제외했습니다. 쓰려면 `.mcp.json`에 추가하세요:

```json
"github": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-github@2025.4.8"],
            "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "<token>" } }
```

## 재생성

`../harness`(OpenCode)가 갱신되면 이 하네스를 다시 생성할 수 있습니다:

```bash
node scripts/generate-from-opencode.cjs
```

agents·commands·skills·conventions·`.mcp.json`를 재생성합니다. 손으로 작성·이식한 파일은 보존됩니다: `CLAUDE.md`·`settings.json`·`hooks/`·`conventions/README.md`·이 README, ECC 이식분(`observer.md` 에이전트, `learn`/`instinct-*`/`evolve` 커맨드, `continuous-learning-v2` 스킬).

생성기가 자동으로 처리하는 변환:
- **제외 목록** — 실행 대상 스크립트가 없는 커맨드(instinct 계열·`/setup-pm`·`/harness-audit`·`/security-scan`)와 교육 스택 밖 언어(go/cpp/kotlin/php/python/rust)의 에이전트·커맨드는 생성하지 않고, 남아 있는 이전 생성물(stale)도 제거합니다.
- **모델 라우팅 변환** — `config/pdca.config.json`의 OpenCode용 `modelRouting`(Ollama 단일 모델)을 제거하고, 에이전트 frontmatter의 opus/sonnet/haiku 티어를 따르도록 주석을 갱신합니다.
- **표현 치환** — 본문에 남은 OpenCode 전용 표현(AGENTS.md, 로컬 Ollama 단일 모델 등)을 Claude Code 표현으로 치환합니다.
