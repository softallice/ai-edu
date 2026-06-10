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

## 실행

```bash
cd harness-claude-code
claude
```

Claude Code가 이 폴더의 `.claude/`(agents·commands·skills·settings·hooks) · `CLAUDE.md` · `.mcp.json` 를 자동 로드합니다.

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
│  ├─ agents/*.md (26)        # 서브에이전트 (frontmatter: name/description/model/tools)
│  ├─ commands/*.md (40)      # 슬래시 커맨드
│  ├─ skills/*/SKILL.md (12)  # 도메인 스킬 (자동 활성화)
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
| **sonnet** | code-reviewer · tdd-guide · 언어별 reviewer/build-resolver · e2e-runner · refactor-cleaner · database-reviewer · harness-optimizer · loop-operator (+ 기본 모델) |
| **haiku** | doc-updater · docs-lookup |

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

## 훅 (settings.json)

- **PreToolUse(Bash)** — `--no-verify`(git hook 우회)·광역 `rm -rf /` 차단.
- **PostToolUse(Edit|Write|MultiEdit)** — JS/TS/JSON/CSS/MD prettier 자동 포맷(설치 시), `console.log` 경고.

훅은 `node`로 실행되는 자기완결 스크립트입니다(외부 의존성 없음).

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

agents·commands·skills·conventions·`.mcp.json`를 재생성합니다(손으로 작성한 `CLAUDE.md`·`settings.json`·`hooks/`·이 README는 보존).
