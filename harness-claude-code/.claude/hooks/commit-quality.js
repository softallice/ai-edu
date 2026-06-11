#!/usr/bin/env node
/**
 * PreToolUse(Bash) — git commit 전 품질 검사. (ECC pre-bash-commit-quality.js 각색)
 *
 * - 스테이징 파일에서 console.log / debugger / 시크릿 패턴 / 이슈 번호 없는 TODO 탐지
 * - 커밋 메시지 conventional commit 형식 검사
 * - 로컬 ESLint 설치 시 스테이징 JS/TS 린트
 *
 * exit 0 = 허용(경고는 stderr) · exit 2 = 차단(시크릿/debugger/ESLint 오류)
 */
'use strict'

const { spawnSync } = require('child_process')
const path = require('path')
const fs = require('fs')

// 구체적 키 포맷은 error(차단), 일반 패턴은 warning(placeholder 오탐 가능성 때문)
const SECRET_PATTERNS = [
  { pattern: /sk-[a-zA-Z0-9]{20,}/, name: 'OpenAI API key', sev: 'error' },
  { pattern: /sk-ant-[a-zA-Z0-9-]{20,}/, name: 'Anthropic API key', sev: 'error' },
  { pattern: /ghp_[a-zA-Z0-9]{36}/, name: 'GitHub PAT', sev: 'error' },
  { pattern: /AKIA[A-Z0-9]{16}/, name: 'AWS Access Key', sev: 'error' },
  { pattern: /api[_-]?key\s*[=:]\s*['"][^'"]+['"]/i, name: 'API key', sev: 'warning' },
]
// 명백한 템플릿/placeholder 줄은 시크릿 검사에서 제외
const SECRET_FALSE_POSITIVE = /\$\{|process\.env|import\.meta\.env|placeholder|your[-_]?api|example|<[^>]+>/i

function git(args) {
  const r = spawnSync('git', args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
  return r.status === 0 ? r.stdout : null
}

function findFileIssues(filePath) {
  const issues = []
  const content = git(['show', `:${filePath}`]) // 작업트리가 아니라 스테이징된 내용 검사
  if (content == null) return issues

  content.split('\n').forEach((line, i) => {
    const n = i + 1
    const t = line.trim()
    if (line.includes('console.log') && !t.startsWith('//') && !t.startsWith('*'))
      issues.push({ sev: 'warning', msg: `console.log (line ${n})` })
    if (/\bdebugger\b/.test(line) && !t.startsWith('//'))
      issues.push({ sev: 'error', msg: `debugger 문 (line ${n})` })
    const todo = line.match(/\/\/\s*(TODO|FIXME):?\s*(.+)/)
    if (todo && !/#\d+|issue/i.test(todo[2]))
      issues.push({ sev: 'info', msg: `이슈 번호 없는 ${todo[1]} (line ${n})` })
    if (!SECRET_FALSE_POSITIVE.test(line)) {
      for (const { pattern, name, sev } of SECRET_PATTERNS) {
        if (pattern.test(line)) issues.push({ sev, msg: `${name} 노출 의심 (line ${n})` })
      }
    }
  })
  return issues
}

function validateMessage(command) {
  const m = command.match(/(?:-m|--message)[=\s]+["']?([^"']+)["']?/)
  if (!m) return []
  const msg = m[1]
  const out = []
  if (!/^(feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert)(\(.+\))?:\s*.+/.test(msg))
    out.push('conventional commit 형식이 아님 — 예: "feat(auth): add login flow"')
  if (msg.length > 72) out.push(`첫 줄이 너무 김 (${msg.length}자, 최대 72자)`)
  if (msg.endsWith('.')) out.push('첫 줄은 마침표로 끝내지 않음')
  return out
}

function runEslint(files) {
  const jsFiles = files.filter((f) => /\.(js|jsx|ts|tsx)$/.test(f))
  if (jsFiles.length === 0) return null
  const bin = path.join(process.cwd(), 'node_modules', '.bin', process.platform === 'win32' ? 'eslint.cmd' : 'eslint')
  if (!fs.existsSync(bin)) return null
  const r = spawnSync(bin, ['--format', 'compact', ...jsFiles], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 30000,
    shell: process.platform === 'win32',
  })
  return { success: r.status === 0, output: r.stdout || r.stderr || '' }
}

let raw = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (c) => (raw += c))
process.stdin.on('end', () => {
  let command = ''
  try {
    command = JSON.parse(raw || '{}').tool_input?.command || ''
  } catch {
    process.exit(0)
  }
  // git commit 명령에서만 동작 (amend는 통과)
  if (!command.includes('git commit') || command.includes('--amend')) process.exit(0)

  // 스테이징 목록은 저장소 루트 기준 경로 — git show :path 에는 그대로 쓰고,
  // ESLint 등 파일시스템 접근에는 루트로 절대화해서 쓴다(하네스가 하위 디렉터리여도 동작).
  const root = (git(['rev-parse', '--show-toplevel']) || '').trim()
  const staged = (git(['diff', '--cached', '--name-only', '--diff-filter=ACMR']) || '')
    .trim().split('\n').filter(Boolean)
  if (staged.length === 0) process.exit(0)

  const checkable = staged.filter((f) => /\.(js|jsx|ts|tsx|java|py)$/.test(f))
  let errors = 0
  let warnings = 0

  for (const f of checkable) {
    const issues = findFileIssues(f)
    if (issues.length) {
      console.error(`\n[FILE] ${f}`)
      for (const it of issues) {
        console.error(`  ${it.sev.toUpperCase()}: ${it.msg}`)
        if (it.sev === 'error') errors++
        else if (it.sev === 'warning') warnings++
      }
    }
  }

  for (const m of validateMessage(command)) {
    console.error(`  WARNING(메시지): ${m}`)
    warnings++
  }

  const lint = runEslint(root ? checkable.map((f) => path.join(root, f)) : checkable)
  if (lint && !lint.success) {
    console.error('\nESLint 오류:\n' + lint.output)
    errors++
  }

  if (errors > 0) {
    console.error(`\n차단: 치명 이슈 ${errors}건 (경고 ${warnings}건). 수정 후 다시 커밋하세요.`)
    process.exit(2)
  }
  if (warnings > 0) console.error(`\n경고 ${warnings}건 — 커밋은 허용되지만 정리를 권장합니다.`)
  process.exit(0)
})
