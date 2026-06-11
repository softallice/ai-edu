#!/usr/bin/env node
/**
 * PostToolUse(Edit|Write|MultiEdit) — 편집 파일 경로 누적. (ECC post-edit-accumulator.js 각색)
 *
 * 편집된 파일을 세션별 임시 파일에 한 줄씩 기록한다. Stop 시점에
 * stop-format-typecheck.js 가 이 목록을 읽어 포맷+타입체크를 일괄 1회 실행한다
 * (편집마다 포매터를 돌리는 것보다 빠르고, tsc는 편집 직후엔 어차피 불완전).
 * appendFileSync 라 동시 훅 프로세스가 서로 덮어쓰지 않고, 중복 제거는 Stop 쪽에서 한다.
 */
'use strict'

const crypto = require('crypto')
const fs = require('fs')
const os = require('os')
const path = require('path')

// 포맷 대상 전부 누적 (포맷: prettier 전체 / 타입체크: ts·tsx만 — Stop 쪽에서 구분)
const FORMATABLE = /\.(ts|tsx|js|jsx|json|css|md)$/

// ⚠ stop-format-typecheck.js 의 accumFile() 과 반드시 동일하게 유지할 것
//   (prefix·세션 ID 해석이 어긋나면 Stop 훅이 누적 파일을 찾지 못해 조용히 무력화됨)
function accumFile(sessionId) {
  const raw = sessionId || process.env.CLAUDE_SESSION_ID || crypto.createHash('sha1').update(process.cwd()).digest('hex').slice(0, 12)
  const id = String(raw).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64)
  return path.join(os.tmpdir(), `harness-edited-${id}.txt`)
}

let raw = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (c) => (raw += c))
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(raw || '{}')
    const file = accumFile(input.session_id)
    const add = (p) => {
      if (p && FORMATABLE.test(p)) fs.appendFileSync(file, p + '\n', 'utf8')
    }
    add(input.tool_input?.file_path)
    if (Array.isArray(input.tool_input?.edits)) for (const e of input.tool_input.edits) add(e?.file_path)
  } catch {
    /* 무시 */
  }
  process.exit(0)
})
