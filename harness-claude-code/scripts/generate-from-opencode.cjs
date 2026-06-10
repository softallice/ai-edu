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

// --- 도구 매핑 (OpenCode 권한 → Claude Code 도구) ---
function mapTools(t = {}) {
  const out = ['Read', 'Grep', 'Glob']
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
}

function copyDir(src, dst) {
  ensureDir(dst)
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name)
    const d = path.join(dst, e.name)
    if (e.isDirectory()) copyDir(s, d)
    else fs.copyFileSync(s, d)
  }
}

// ============ 1) Agents ============
ensureDir(path.join(CLAUDE, 'agents'))
let agentCount = 0
for (const [name, a] of Object.entries(oc.agent)) {
  if (name === 'build') continue // build = Claude Code 기본(메인) 에이전트 → CLAUDE.md로 표현
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
  agentCount++
}

// ============ 2) Commands ============
ensureDir(path.join(CLAUDE, 'commands'))
const cmdDir = path.join(SRC, 'commands')
let cmdCount = 0
// apply-convention 커맨드는 Claude Code 전용판(CLAUDE.md overlay)으로 손으로 관리 → 건너뜀
const HAND_MAINTAINED_CMDS = new Set(['apply-convention.md'])
for (const file of fs.readdirSync(cmdDir).filter((f) => f.endsWith('.md'))) {
  if (HAND_MAINTAINED_CMDS.has(file)) continue
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
  if (agent && oc.agent[agent]) {
    out += `> 이 작업은 **${agent}** 서브에이전트에 위임하세요(Task 도구로 \`${agent}\` 호출).\n\n`
  }
  out += claudeFix(body.trimStart())
  if (!out.endsWith('\n')) out += '\n'
  fs.writeFileSync(path.join(CLAUDE, 'commands', file), out)
  cmdCount++
}

// ============ 3) Skills / Conventions / Config 복사 ============
copyDir(path.join(SRC, 'skills'), path.join(CLAUDE, 'skills'))
copyDir(path.join(SRC, 'conventions'), path.join(DST, 'conventions'))
// config 는 pdca.config.json 만 가져온다(opencode.server.example.json 등 OpenCode 전용 제외)
ensureDir(path.join(DST, 'config'))
if (fs.existsSync(path.join(SRC, 'config', 'pdca.config.json'))) {
  fs.copyFileSync(path.join(SRC, 'config', 'pdca.config.json'), path.join(DST, 'config', 'pdca.config.json'))
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

console.log(`✓ agents: ${agentCount}`)
console.log(`✓ commands: ${cmdCount}`)
console.log(`✓ skills/conventions/config copied`)
console.log(`✓ .mcp.json: ${Object.keys(mcpServers).join(', ')}`)
