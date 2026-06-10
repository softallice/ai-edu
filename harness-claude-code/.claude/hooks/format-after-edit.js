#!/usr/bin/env node
/**
 * PostToolUse(Edit|Write|MultiEdit) 후처리.
 * - JS/TS/JSON/CSS/MD 파일은 prettier 로 자동 포맷(설치돼 있을 때만, best-effort)
 * - 편집 파일에 console.log 가 있으면 경고(비차단)
 * 입력: stdin JSON { tool_input: { file_path } }
 * 모든 경로에서 exit 0 (포맷 실패가 작업을 막지 않도록).
 */
const { execSync } = require('child_process')
const fs = require('fs')

let data = ''
process.stdin.on('data', (c) => (data += c))
process.stdin.on('end', () => {
  let fp = ''
  try {
    const ti = JSON.parse(data || '{}').tool_input || {}
    fp = ti.file_path || ti.filePath || ti.path || ''
  } catch {
    process.exit(0)
  }
  if (!fp) process.exit(0)

  if (/\.(ts|tsx|js|jsx|json|css|md)$/.test(fp)) {
    try {
      execSync(`npx --no-install prettier --write ${JSON.stringify(fp)}`, { stdio: 'ignore' })
    } catch {
      /* prettier 미설치 등 → 무시 */
    }
  }
  if (/\.(ts|tsx|js|jsx)$/.test(fp)) {
    try {
      const src = fs.readFileSync(fp, 'utf8')
      if (/\bconsole\.log\s*\(/.test(src)) {
        console.error(`경고: ${fp} 에 console.log 가 있습니다. 커밋 전에 제거하세요.`)
      }
    } catch {
      /* 무시 */
    }
  }
  process.exit(0)
})
