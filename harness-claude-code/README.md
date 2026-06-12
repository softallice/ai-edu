# ai-edu Claude Code 하네스 (harness-claude-code)

Claude Code 위에 얹는 **에이전트·커맨드·스킬·훅·컨벤션 설정 묶음**입니다.
PDCA 방법론, 품질 게이트 훅, 자가 학습(Continuous Learning v2), 사이트별 컨벤션 체계를 제공하며,
**교육 실습**과 **실무 프로젝트** 양쪽에서 사용할 수 있습니다. (v1.0.0)

> ai-edu의 OpenCode 하네스(`../harness`)를 Claude Code 네이티브로 포팅한 자매 하네스입니다.
> OpenCode판은 로컬 Ollama 단일 모델, 이 하네스는 **클라우드 Claude 멀티 티어(opus/sonnet/haiku)** 를 사용합니다.

| 구성 | 수량 | 내용 |
|------|------|------|
| 에이전트 | 17 | planner·architect·code-reviewer·tdd-guide·java-reviewer·observer 등 (모델 티어링) |
| 슬래시 커맨드 | 29 | /pdca-full /plan /tdd /code-review /learn /evolve 등 |
| 스킬 | 13 | pdca·tdd-workflow·backend/frontend-patterns·continuous-learning-v2 등 (자동 활성화) |
| 훅 | 8 | 위험 차단·시크릿 감지·일괄 포맷+타입체크·학습 관측 |
| 컨벤션 팩 | 5 | common·react-typescript·spring-boot·nexacro·egov-backend |

---

## 1. 설치 준비사항

### 필수

| 도구 | 확인 | 없으면 |
|------|------|--------|
| Claude Code CLI | `claude --version` | `npm install -g @anthropic-ai/claude-code` |
| Node.js ≥18 | `node -v` | nvm 등으로 설치 (훅 스크립트 실행용) |
| git | `git --version` | OS 패키지 매니저 |
| Anthropic 인증 | `claude` 첫 실행 시 로그인 | `ANTHROPIC_API_KEY` 환경변수 또는 브라우저 로그인 |

### 선택 (해당 기능 사용 시)

| 도구 | 필요한 기능 |
|------|------------|
| Python 3 (`python3 -V`) | Continuous Learning v2 커맨드 (`/instinct-status` `/evolve` 등) |
| 프로젝트에 prettier·typescript devDependency | Stop 훅의 일괄 자동 포맷·타입체크 (미설치 시 조용히 건너뜀) |

---

## 2. 설치

용도에 따라 세 가지 모드 중 선택합니다.

| 모드 | 적용 범위 | 적합한 경우 | 방법 |
|------|----------|------------|------|
| **교육** | 하네스 폴더 안에서만 | 수업·실습 | 설치 없음 — 폴더에서 바로 실행 |
| **전역 설치** | 모든 프로젝트 | 실무 표준 환경 | `./install.sh` |
| **프로젝트 설치** | 해당 레포만 | 팀 공용 머신, 파일럿 | `./install.sh --project <레포>` |

### 2-1. 교육 모드 (설치 없음)

```bash
cd harness-claude-code
claude
```

Claude Code가 이 폴더의 `.claude/`(agents·commands·skills·settings·hooks) · `CLAUDE.md` · `.mcp.json` 를 자동 로드합니다. **이 폴더를 벗어나면 적용되지 않습니다.**

### 2-2. 전역 설치 (실무 권장)

```bash
./install.sh
```

`~/.claude/` 에 에이전트·커맨드·스킬·훅·컨벤션을 설치해 **어떤 프로젝트 폴더에서 `claude`를 실행해도** 하네스가 적용됩니다.

안전 장치:
- 기존 `~/.claude/settings.json` 은 **백업 후 병합** (덮어쓰지 않음 — 사용자의 모델·훅·권한 설정 보존)
- 설치 파일을 매니페스트로 추적 → 제거 시 하네스 항목만 깨끗이 제거
- 같은 이름의 기존 파일은 `.bak` 백업 후 교체, 제거 시 복원

### 2-3. 프로젝트 설치

```bash
./install.sh --project ~/work/사이트레포
```

해당 레포의 `.claude/` 로만 복사합니다. 전역 환경을 건드리지 않습니다.

### 2-4. 업데이트 · 제거

```bash
git pull && ./install.sh      # 업데이트 (매니페스트 기준 갱신)
./install.sh --uninstall      # 전역 설치 제거 (사용자 자체 설정·백업본 보존)
```

---

## 3. 빠른 시작 (5분)

```bash
# 전역 설치했다면 아무 프로젝트에서, 교육 모드면 하네스 폴더에서
claude

# ① 커맨드 로드 확인
/help                          # /pdca-full, /plan, /tdd ... 보이면 OK

# ② 자연어로 시작
"간단한 할 일(todo) REST API를 만들어줘"

# ③ 또는 PDCA로 통제된 개발
/pdca-full todo-api            # 계획→설계→구현→검증(게이트)→개선→보고
```

---

## 4. 사용법

### 4-1. 주요 커맨드

| 분류 | 커맨드 | 설명 |
|------|--------|------|
| 계획·개발 | `/plan` `/tdd` `/build-fix` | 구현 계획(승인 후 진행) · 테스트 우선 개발 · 빌드 오류 수정 |
| 품질 | `/code-review` `/security` `/verify` `/quality-gate` `/refactor-clean` `/test-coverage` | 리뷰 · 보안 점검 · 종합 검증 · 게이트 실행 · 정리 · 커버리지 |
| PDCA | `/pdca-full <기능>` `/pdca <단계> <기능>` `/pdca-status` `/pdca-next` | 전체 루프 · 단일 단계 · 진행 상태 · 다음 단계 추천 |
| 학습 | `/learn` `/instinct-status` `/evolve` `/instinct-export` `/instinct-import` | 패턴 저장 · 현황 · 스킬 진화 · 팀 공유 |
| 기타 | `/e2e` `/orchestrate` `/checkpoint` `/update-docs` `/apply-convention` | E2E · 다중 에이전트 · 체크포인트 · 문서 갱신 · 컨벤션 적용 |

전체 29종은 `/help` 또는 `.claude/commands/` 참고.

### 4-2. PDCA 워크플로우

```
plan → design → do → check ──(게이트 전부 통과)──→ report
                       └─(미달)→ iterate → check ↺ (최대 3회)
```

품질 게이트: L1 코드품질 ≥80 · L2 설계일치 ≥90% · **L3 테스트·동작 ≥90%(CRITICAL)** · L4 빌드 ≥90%.
기준은 `config/pdca.config.json`, 방법론 상세는 [`../docs/2.PDCA-방법론.md`](../docs/2.PDCA-방법론.md).

### 4-3. 서브에이전트 위임

복잡한 작업은 전문 에이전트에 위임됩니다(자동 또는 명시 요청):

| 티어 | 에이전트 | 용도 |
|------|----------|------|
| **opus** | planner · architect · security-reviewer · pdca-orchestrator | 계획·설계·보안·오케스트레이션 |
| **sonnet** (기본) | code-reviewer · tdd-guide · java-reviewer · java-build-resolver · build-error-resolver · e2e-runner · refactor-cleaner · database-reviewer · harness-optimizer · loop-operator | 구현·리뷰·수정 |
| **haiku** | doc-updater · docs-lookup · observer | 문서·조회·관측 분석(경량) |

기본 모델·티어 변경: `.claude/settings.json`의 `model`, 에이전트별 `model:` frontmatter.
에이전트↔스킬 연계 규칙은 `CLAUDE.md`의 매핑 표 참고.

### 4-4. 학습 시스템 (Continuous Learning v2)

세션 패턴을 confidence 점수가 붙은 **인스팅트**로 축적하고 스킬로 진화시킵니다.

```
작업 → observe.js(자동 관측) → /learn(수동 저장) 또는 observer 에이전트(일괄 분석)
     → /instinct-status(현황) → /evolve(클러스터링 → 스킬 초안) → /instinct-export·import(팀 공유)
```

- 저장소: `${XDG_DATA_HOME:-~/.local/share}/ecc-homunculus/` — 사용자 전역이므로 **여러 실무 프로젝트의 학습이 누적**됩니다
- ECC 원본 대비 단순화: 백그라운드 데몬 없음(observer 에이전트 온디맨드 호출), 전역 스코프
- 관측 끄기: `HARNESS_SKIP_OBSERVE=1`

### 4-5. 사이트별 컨벤션

사이트(레포)마다 다른 코딩 규칙을 overlay로 적용합니다. common 팩은 항상 포함됩니다.

```bash
# 전역 설치 후 (권장 — 하네스 레포 위치와 무관)
node scripts/apply-convention.cjs ~/work/사이트레포 --from-home nexacro egov-backend
node scripts/apply-convention.cjs ~/work/포털레포  --from-home --profile react-spring

# 교육 모드 (하네스 clone 상대경로 참조)
node scripts/apply-convention.cjs <레포> react-typescript
```

→ 해당 레포에 컨벤션 `@import`를 담은 `CLAUDE.md`가 생성되고, 그 레포에서 `claude` 실행 시 로드됩니다.
팩 구조·프로파일·새 팩 추가는 [`conventions/README.md`](conventions/README.md) 참고.

---

## 5. 구성 레퍼런스

```
harness-claude-code/
├─ CLAUDE.md                  # 메인 지침 (build 역할·원칙·티어·PDCA·에이전트↔스킬 매핑)
├─ VERSION                    # 하네스 버전
├─ install.sh                 # 전역/프로젝트 설치 + 제거
├─ .mcp.json                  # MCP 서버 (context7·playwright·memory·sequential-thinking)
├─ .claude/
│  ├─ settings.json           # 모델·권한·훅 배선
│  ├─ agents/*.md (17)        # 서브에이전트 (frontmatter: name/description/model/tools)
│  ├─ commands/*.md (29)      # 슬래시 커맨드
│  ├─ skills/*/SKILL.md (13)  # 도메인 스킬 (자동 활성화)
│  └─ hooks/*.js (8)          # 자기완결 훅 스크립트
├─ conventions/               # 컨벤션 팩 5종 + profiles.json
├─ config/pdca.config.json    # PDCA 단계·게이트·임계값
└─ scripts/
   ├─ apply-convention.cjs        # 사이트 overlay 생성기 (--from-home 지원)
   ├─ merge-settings.cjs          # settings.json 안전 병합/해제 (install.sh가 사용)
   └─ generate-from-opencode.cjs  # ../harness → 이 하네스 변환기 (유지보수용)
```

### 훅 (settings.json)

| 이벤트 | 훅 | 동작 |
|--------|-----|------|
| PreToolUse(Bash) | guard-bash.js | `--no-verify`·광역 `rm -rf /` **차단** (플래그 변형 포함) |
| PreToolUse(Bash) | commit-quality.js | `git commit` 전 스테이징 검사 — 실제 시크릿 포맷/debugger **차단**, 형식·console.log 경고 |
| PreToolUse(Write\|Edit\|MultiEdit) | config-protection.js | 린터/포매터 설정 약화 **차단** (최초 생성은 허용) |
| PreToolUse(Write\|Edit\|MultiEdit) | suggest-compact.js | 편집 50회+25회 간격으로 전략적 `/compact` 제안 |
| PostToolUse(Edit\|Write\|MultiEdit) | post-edit-accumulator.js | 편집 파일 경로 누적 (Stop 일괄 처리용) |
| PostToolUse(*) | observe.js (async) | CL-v2 관측 캡처 (시크릿 마스킹, 10MB 회전) |
| Stop | stop-format-typecheck.js | 누적 파일 **일괄** prettier 포맷 + `tsc --noEmit` |
| Stop | check-console-log.js | git 변경 파일의 console.log 잔존 경고 |

훅은 `node`로 실행되는 자기완결 스크립트입니다(외부 의존성 없음). 하네스가 git 저장소의 하위 디렉터리여도 동작합니다.
`settings.json`의 `deny: Bash(rm -rf /:*)`는 훅과 같은 일을 하는 **의도된 이중 방어**입니다.

### MCP

기본 활성: `context7`(문서) · `playwright`(E2E) · `memory` · `sequential-thinking`.
토큰/네트워크가 필요한 `github`·`exa`는 기본 제외 — 필요하면 `.mcp.json`에 추가:

```json
"github": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-github@2025.4.8"],
            "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "<token>" } }
```

---

## 6. 문제 해결

| 증상 | 원인 · 해결 |
|------|------------|
| 커맨드/에이전트가 안 보임 (`/help`에 없음) | 교육 모드인데 하네스 폴더 밖에서 실행 → 폴더로 이동하거나 `./install.sh` 전역 설치 |
| 전역 설치 후에도 훅이 동작 안 함 | `~/.claude/settings.json`에 hooks 병합 여부 확인 (`grep guard-bash ~/.claude/settings.json`) · `node -v` 확인 |
| `/instinct-*` 실행 시 python3 오류 | Python 3 설치 필요 (선택 의존성 — 1장 참고) |
| 자동 포맷/타입체크가 안 됨 | 해당 프로젝트에 prettier·typescript devDependency 필요 (`npx --no-install` 방식이라 미설치 시 건너뜀) |
| 커밋이 차단됨 (시크릿 의심) | 실제 키 포맷(sk-, ghp_, AKIA)이 스테이징에 있음 → 제거 후 커밋. placeholder는 `${...}`·`process.env` 형태면 통과 |
| 설정 파일(.eslintrc 등) 수정이 차단됨 | config-protection 훅의 의도된 동작 — 코드를 고치는 게 우선, 정당한 변경이면 사용자가 직접 승인 |
| CL-v2 실행 시 "LEGACY DATA DETECTED" 경고 | 옛 `~/.claude/homunculus` 데이터 감지 — 출력에 안내되는 마이그레이션 스크립트로 이전 |
| 전역 설치를 되돌리고 싶음 | `./install.sh --uninstall` — 그래도 문제면 `~/.claude/settings.json.pre-harness.bak` 수동 복원 |
| 모델 응답이 비쌈/느림 | `.claude/settings.json`의 `model`을 haiku로, 또는 에이전트별 티어 하향 |

---

## 7. 유지보수 (하네스 개발자용)

### OpenCode 하네스에서 재생성

`../harness`(OpenCode)가 갱신되면 다시 변환할 수 있습니다:

```bash
node scripts/generate-from-opencode.cjs
```

- **보존되는 손수 관리 파일**: `CLAUDE.md` · `settings.json` · `hooks/` · `conventions/README.md` · `install.sh` · 이 README · ECC 이식분(`observer.md` 에이전트, `learn`/`instinct-*`/`evolve` 커맨드, `continuous-learning-v2` 스킬)
- **생성하지 않는 것**: 대상 기능이 없는 커맨드(`promote`·`projects` — CL-v2 프로젝트 스코프 미포팅, `setup-pm`·`harness-audit`·`security-scan` — 대상 스크립트 부재)와 교육 스택 밖 언어(go/cpp/kotlin/php/python/rust)의 에이전트·커맨드. 남은 이전 생성물(stale)은 자동 제거
- **자동 변환**: OpenCode 전용 표현·경로 치환(`@skills/`→`@.claude/skills/`, 미존재 pdca-status 도구→상태 파일 직접 갱신 등), `pdca.config.json`의 modelRouting 제거(에이전트 티어가 단일 진실), 에이전트 tools에 `Skill` 부여

### OpenCode 하네스 대비 매핑

| 영역 | OpenCode(`harness/`) | Claude Code(이 폴더) |
|------|----------------------|----------------------|
| 모델 | 단일 `ollama/qwen2.5-coder:7b` | opus/sonnet/haiku 티어 |
| 에이전트 | `opencode.json` `agent{}` + `prompts/*.txt` | `.claude/agents/*.md` |
| 커맨드 | `commands/*.md` | `.claude/commands/*.md` |
| 스킬 | `instructions` 배열 로드 | `.claude/skills/` 자동 활성화 |
| 훅 | TS 플러그인 | `settings.json` + `.claude/hooks/*.js` |
| 지침 | `AGENTS.md`·`INSTRUCTIONS.md` | `CLAUDE.md` (+ 컨벤션 `@import`) |
| 배포 | `~/.config/opencode` 심볼릭 링크 | `install.sh` (전역/프로젝트, 매니페스트 추적) |
