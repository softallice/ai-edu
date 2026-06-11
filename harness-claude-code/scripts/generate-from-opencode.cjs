#!/usr/bin/env node
/**
 * generate-from-opencode.cjs
 *
 * ai-edu OpenCode 하네스(../harness)를 Claude Code 네이티브 하네스로 변환한다.
 * - agent(opencode.json) → .claude/agents/<name>.md (frontmatter: name/description/model/tools + 본문)
 * - command(commands/*.md) → .claude/commands/<name>.md (OpenCode 전용 키 제거, 서브에이전트 위임 주석)
 * - skills / conventions / config → 그대로 복사
 * - mcp(opencode.json) → .mcp.json
 *
 * settings.json / CLAUDE.md / hooks / README 는 손으로 작성(이 스크립트 범위 밖).
 */
const fs = require('fs')
const path = require('path')

const SRC = path.resolve(__dirname, '..', '..', 'harness') // ai-edu/harness
const DST = path.resolve(__dirname, '..') // ai-edu/harness-claude-code
const CLAUDE = path.join(DST, '.claude')

const oc = JSON.parse(fs.readFileSync(path.join(SRC, 'opencode.json'), 'utf8'))

// --- 모델 티어링 (원본 ECC 방식 복원) ---
const OPUS = new Set(['planner', 'architect', 'security-reviewer', 'pdca-orchestrator'])
const HAIKU = new Set(['docs-lookup', 'doc-updater'])
const modelFor = (name) => (OPUS.has(name) ? 'opus' : HAIKU.has(name) ? 'haiku' : 'sonnet')

// --- 제외 목록 ---
// 교육 스택(React-TS + Spring Boot/Java) 밖의 언어별 에이전트는 생성하지 않는다.
const EXCLUDED_AGENTS = new Set([
  'go-reviewer', 'go-build-resolver',
  'cpp-reviewer', 'cpp-build-resolver',
  'kotlin-reviewer', 'kotlin-build-resolver',
  'php-reviewer', 'python-reviewer',
  'rust-reviewer', 'rust-build-resolver',
])
// 실행 대상(스크립트/스킬/외부 도구)이 이 하네스에 없거나 교육 스택 밖인 커맨드는 생성하지 않는다.
const EXCLUDED_CMDS = new Set([
  'promote.md', 'projects.md', // CL-v2 프로젝트 스코프 미포팅(전역 전용) — 대상 기능 없음
  'setup-pm.md',      // scripts/setup-package-manager.js 부재
  'harness-audit.md', // scripts/harness-audit.js 부재
  'security-scan.md', // AgentShield·skills/security-scan 부재 → /security 사용
  // 교육 스택 밖 언어
  'go-build.md', 'go-review.md', 'go-test.md',
  'rust-build.md', 'rust-review.md', 'rust-test.md',
])
// ECC에서 이식한 손수 관리 에이전트 — 재생성 시 보존
const HAND_MAINTAINED_AGENTS = new Set(['observer.md'])

// --- 도구 매핑 (OpenCode 권한 → Claude Code 도구) ---
// Skill 포함: 서브에이전트는 메인 컨텍스트의 스킬을 상속하지 않으므로,
// 본문이 스킬을 참조할 때 직접 호출(또는 SKILL.md Read)할 수 있어야 한다.
function mapTools(t = {}) {
  const out = ['Read', 'Grep', 'Glob', 'Skill']
  if (t.bash) out.push('Bash')
  if (t.edit) out.push('Edit', 'MultiEdit')
  if (t.write) out.push('Write')
  return out
}

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true })
}

// OpenCode 소스 프롬프트/커맨드 본문에 남은 OpenCode 전용 표현을 Claude Code 표현으로 치환.
function claudeFix(text) {
  return text
    .replace(/`opencode\.json` instructions \+ `AGENTS\.md`/g, '`CLAUDE.md` with `@import`')
    .replace(/the loaded instructions \/ project `AGENTS\.md`/g, 'the loaded `CLAUDE.md` / imported convention packs')
    .replace(/\(common, react-typescript, nexacro, egov-backend\)/g, '(common, react-typescript, spring-boot, nexacro, egov-backend)')
    .replace(/project rules in instructions\/INSTRUCTIONS\.md and AGENTS\.md/g, 'project rules in CLAUDE.md and the active convention packs')
    .replace(
      /Since hooks are not available in OpenCode, remember to:/g,
      'This harness auto-formats edited files via a PostToolUse hook; still verify after review:'
    )
    .replace(/본 하네스\(로컬 Ollama 단일 모델\)에서/g, '본 하네스에서')
    // 제외된 언어별 에이전트를 예시 표에서 교육 스택(java)으로 교체 (orchestrate.md)
    .replace(
      /\| go-reviewer \| Go code \| Go-specific review \|\n\| go-build-resolver \| Go builds \| Go build errors \|/g,
      '| java-reviewer | Java code | Java-specific review |\n| java-build-resolver | Java builds | Maven/Gradle build errors |'
    )
    // ── 에이전트↔스킬 연계 경로 수정 ──
    // OpenCode 는 skills/ 가 루트에 있었지만 Claude Code 는 .claude/skills/ — @import 경로 보정
    .replace(/@skills\//g, '@.claude/skills/')
    // OpenCode 커스텀 도구(tools/pdca-status.ts)는 이 하네스에 없음 → 상태 파일 직접 갱신으로 치환
    .replace(/`pdca-status` 도구 사용/g, '`.pdca-status.json` 파일을 Read/Write 로 직접 갱신')
    .replace(/## 상태 추적 \(`pdca-status` 도구\)/g, '## 상태 추적 (`.pdca-status.json` 직접 갱신)')
    .replace(
      /- 조회: `pdca-status` 도구 `action=show`\n- 갱신: `action=update` \(feature, phase, gates, iterationCount, files, notes\)/g,
      '- 조회: `.pdca-status.json` 을 Read 로 읽기\n- 갱신: 위 스키마대로 해당 feature 항목을 Edit/Write 로 갱신 (phase, gates, iterationCount, files, notes)'
    )
    .replace(/`pdca-status` 도구로/g, '`.pdca-status.json` 파일에')
    .replace(/`pdca-status` 도구\(`action=show`\)로/g, '`.pdca-status.json` 에서')
    .replace(/`pdca-status` 도구를 `action=show`로 호출해 `\.pdca-status\.json`을 읽는다/g, '`.pdca-status.json` 을 Read 로 읽는다')
    .replace(/using the `pdca-status` tool \(`action=update`\)/g, 'by updating `.pdca-status.json` directly (Read then Edit)')
    // 관련 파일 섹션의 OpenCode 경로 → Claude Code 경로
    .replace(/`prompts\/agents\/pdca-orchestrator\.txt` — 오케스트레이터 프롬프트/g, '`.claude/agents/pdca-orchestrator.md` — 오케스트레이터 에이전트')
    .replace(/`commands\/pdca\*\.md` — 커맨드 템플릿/g, '`.claude/commands/pdca*.md` — 커맨드 템플릿')
    .replace(/- `tools\/pdca-status\.ts` — 상태 영속화 도구\n/g, '')
    .replace(/`instructions\/INSTRUCTIONS\.md` — 코딩\/보안\/테스트 규칙/g, '`CLAUDE.md` + 컨벤션 팩 — 코딩/보안/테스트 규칙')
    .replace(/에러 처리\(instructions\/INSTRUCTIONS\.md 준수\)/g, '에러 처리(CLAUDE.md·컨벤션 팩 준수)')
    .replace(/\*\*Q\. 로컬 7B 모델 컨텍스트가 부족하면\?\*\*/g, '**Q. 컨텍스트가 부족해지면?**')
}

// opts.transform: .md 파일 내용 변환 함수 / opts.skip: 최상위에서 건너뛸 파일명(손수 관리 파일 보호)
function copyDir(src, dst, opts = {}) {
  ensureDir(dst)
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (opts.skip && opts.skip.has(e.name)) continue
    const s = path.join(src, e.name)
    const d = path.join(dst, e.name)
    if (e.isDirectory()) copyDir(s, d, { transform: opts.transform })
    else if (opts.transform && e.name.endsWith('.md')) {
      fs.writeFileSync(d, opts.transform(fs.readFileSync(s, 'utf8')))
    } else fs.copyFileSync(s, d)
  }
}

// 생성 대상 디렉터리에서 이번 실행이 쓰지 않은 .md(이전 생성물 잔재)를 제거.
function cleanStale(dir, written, preserve = new Set()) {
  const removed = []
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    if (!written.has(f) && !preserve.has(f)) {
      fs.unlinkSync(path.join(dir, f))
      removed.push(f)
    }
  }
  return removed
}

// ============ 1) Agents ============
ensureDir(path.join(CLAUDE, 'agents'))
let agentCount = 0
const writtenAgents = new Set()
for (const [name, a] of Object.entries(oc.agent)) {
  if (name === 'build') continue // build = Claude Code 기본(메인) 에이전트 → CLAUDE.md로 표현
  if (EXCLUDED_AGENTS.has(name)) continue
  const promptRel = a.prompt && a.prompt.replace(/^{file:/, '').replace(/}$/, '')
  const body = promptRel
    ? fs.readFileSync(path.join(SRC, promptRel), 'utf8').trimEnd()
    : `You are the ${name} agent.`
  const tools = mapTools(a.tools)
  const fm = [
    '---',
    `name: ${name}`,
    `description: ${JSON.stringify(a.description || name)}`,
    `model: ${modelFor(name)}`,
    `tools: [${tools.map((t) => `"${t}"`).join(', ')}]`,
    '---',
    '',
  ].join('\n')
  fs.writeFileSync(path.join(CLAUDE, 'agents', `${name}.md`), fm + claudeFix(body) + '\n')
  writtenAgents.add(`${name}.md`)
  agentCount++
}
const staleAgents = cleanStale(path.join(CLAUDE, 'agents'), writtenAgents, HAND_MAINTAINED_AGENTS)

// ============ 2) Commands ============
ensureDir(path.join(CLAUDE, 'commands'))
const cmdDir = path.join(SRC, 'commands')
let cmdCount = 0
// apply-convention 커맨드는 Claude Code 전용판(CLAUDE.md overlay)으로 손으로 관리 → 건너뜀
// 손수 관리 커맨드: apply-convention(Claude Code 전용판) + ECC에서 이식한 CL-v2 커맨드
// (OpenCode 소스에 같은 이름의 구버전이 있어도 생성하지 않고, stale 정리에서도 보존)
const HAND_MAINTAINED_CMDS = new Set([
  'apply-convention.md',
  'learn.md', 'instinct-status.md', 'instinct-export.md', 'instinct-import.md', 'evolve.md',
])
const writtenCmds = new Set()
for (const file of fs.readdirSync(cmdDir).filter((f) => f.endsWith('.md'))) {
  if (HAND_MAINTAINED_CMDS.has(file) || EXCLUDED_CMDS.has(file)) continue
  const raw = fs.readFileSync(path.join(cmdDir, file), 'utf8')
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  let fmText = '',
    body = raw
  if (m) {
    fmText = m[1]
    body = m[2]
  }
  const descM = fmText.match(/description:\s*(.+)/)
  const agentM = fmText.match(/agent:\s*(?:everything-claude-code:)?(\S+)/)
  const argHintM = fmText.match(/argument-hint:\s*(.+)/)
  const description = descM ? descM[1].trim() : file.replace('.md', '')
  const agent = agentM ? agentM[1].trim() : null

  const fmLines = ['---', `description: ${description}`]
  if (argHintM) fmLines.push(`argument-hint: ${argHintM[1].trim()}`)
  fmLines.push('---', '')
  let out = fmLines.join('\n')
  // build 는 서브에이전트가 아니라 메인 에이전트 자신이므로 위임 노트를 달지 않는다.
  if (agent && agent !== 'build' && oc.agent[agent] && !EXCLUDED_AGENTS.has(agent)) {
    out += `> 이 작업은 **${agent}** 서브에이전트에 위임하세요(Task 도구로 \`${agent}\` 호출).\n\n`
  }
  out += claudeFix(body.trimStart())
  if (!out.endsWith('\n')) out += '\n'
  fs.writeFileSync(path.join(CLAUDE, 'commands', file), out)
  writtenCmds.add(file)
  cmdCount++
}
const staleCmds = cleanStale(path.join(CLAUDE, 'commands'), writtenCmds, HAND_MAINTAINED_CMDS)

// ============ 3) Skills / Conventions / Config 복사 ============
copyDir(path.join(SRC, 'skills'), path.join(CLAUDE, 'skills'), { transform: claudeFix })
// conventions/README.md 는 OpenCode 사용법 문서 → Claude Code판을 손으로 관리하므로 복사 제외
copyDir(path.join(SRC, 'conventions'), path.join(DST, 'conventions'), {
  transform: claudeFix,
  skip: new Set(['README.md']),
})
// config 는 pdca.config.json 만 가져오되(opencode.server.example.json 등 OpenCode 전용 제외),
// 모델 라우팅은 Claude Code 방식(에이전트 frontmatter의 opus/sonnet/haiku 티어)으로 변환한다.
ensureDir(path.join(DST, 'config'))
if (fs.existsSync(path.join(SRC, 'config', 'pdca.config.json'))) {
  const cfg = JSON.parse(fs.readFileSync(path.join(SRC, 'config', 'pdca.config.json'), 'utf8'))
  cfg.$comment =
    'PDCA 방법론 설정 (nkit-claude-code의 PDCA 엔진을 마이그레이션 비특화 제네릭 버전으로 이식). Claude Code판: 단계별 모델은 별도 라우팅 없이 담당 에이전트 frontmatter(model: opus/sonnet/haiku)를 따른다.'
  delete cfg.modelRouting
  if (cfg.agentMap) {
    cfg.agentMap.$comment =
      '"build"는 서브에이전트가 아니라 메인 에이전트(현재 세션) 자신을 뜻한다. 나머지는 .claude/agents/<name>.md 서브에이전트.'
  }
  fs.writeFileSync(path.join(DST, 'config', 'pdca.config.json'), JSON.stringify(cfg, null, 2) + '\n')
}
// 주의: scripts/apply-convention.cjs 는 Claude Code 전용판(CLAUDE.md overlay 생성)으로
// 손으로 관리하므로 OpenCode판을 복사하지 않는다(덮어쓰기 방지).

// ============ 4) .mcp.json ============
const mcpServers = {}
for (const [name, cfg] of Object.entries(oc.mcp || {})) {
  if (cfg.enabled === false) continue // github/exa 는 토큰·네트워크 필요 → 기본 제외(README 안내)
  if (cfg.type === 'remote') {
    mcpServers[name] = { type: 'http', url: cfg.url }
  } else {
    const [command, ...args] = cfg.command
    mcpServers[name] = { command, args }
    if (cfg.environment) mcpServers[name].env = cfg.environment
  }
}
fs.writeFileSync(path.join(DST, '.mcp.json'), JSON.stringify({ mcpServers }, null, 2) + '\n')

console.log(`✓ agents: ${agentCount}${staleAgents.length ? ` (stale 제거: ${staleAgents.join(', ')})` : ''}`)
console.log(`✓ commands: ${cmdCount}${staleCmds.length ? ` (stale 제거: ${staleCmds.join(', ')})` : ''}`)
console.log(`✓ skills/conventions/config copied (pdca.config: modelRouting 제거, conventions/README.md 보존)`)
console.log(`✓ .mcp.json: ${Object.keys(mcpServers).join(', ')}`)
