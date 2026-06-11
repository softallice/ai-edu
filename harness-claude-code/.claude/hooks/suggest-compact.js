#!/usr/bin/env node
/**
 * PreToolUse(Edit|Write) — 전략적 /compact 제안. (ECC suggest-compact.js 각색)
 *
 * 자동 컴팩션은 작업 도중 임의 시점에 일어나 맥락을 끊는다. 이 훅은 도구 호출
 * 횟수를 세어 논리적 경계(기본 50회, 이후 25회마다)에서 수동 /compact를 제안한다.
 * 제안은 PreToolUse의 additionalContext(JSON stdout)로 모델에 전달된다(비차단).
 *
 * 환경변수: COMPACT_THRESHOLD(기본 50)
 */
'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')

const PREFIX = 'harness-tool-count-'
const TTL_DAYS = 14

function cleanupOld(tempDir, current) {
  const cutoff = Date.now() - TTL_DAYS * 24 * 60 * 60 * 1000
  let entries
  try {
    entries = fs.readdirSync(tempDir, { withFileTypes: true })
  } catch {
    return
  }
  for (const e of entries) {
    if (!e.isFile() || !e.name.startsWith(PREFIX) || e.name === path.basename(current)) continue
    try {
      if (fs.statSync(path.join(tempDir, e.name)).mtimeMs < cutoff)
        fs.rmSync(path.join(tempDir, e.name), { force: true })
    } catch {
      /* 무시 */
    }
  }
}

let raw = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (c) => (raw += c))
process.stdin.on('end', () => {
  let sessionId = ''
  try {
    sessionId = JSON.parse(raw || '{}').session_id || ''
  } catch {
    /* 무시 */
  }
  sessionId = (sessionId || process.env.CLAUDE_SESSION_ID || 'default').replace(/[^a-zA-Z0-9_-]/g, '') || 'default'

  const counterFile = path.join(os.tmpdir(), `${PREFIX}${sessionId}`)
  cleanupOld(os.tmpdir(), counterFile)

  const t = parseInt(process.env.COMPACT_THRESHOLD || '50', 10)
  const threshold = Number.isFinite(t) && t > 0 && t <= 10000 ? t : 50

  let count = 1
  try {
    const prev = parseInt(fs.readFileSync(counterFile, 'utf8').trim(), 10)
    if (Number.isFinite(prev) && prev > 0 && prev <= 1000000) count = prev + 1
  } catch {
    /* 첫 호출 */
  }
  try {
    fs.writeFileSync(counterFile, String(count))
  } catch {
    /* 무시 */
  }

  // matcher 가 Write|Edit|MultiEdit 이므로 실제로는 "편집 호출" 횟수를 센다 — 문구도 그에 맞춤
  let msg = null
  if (count === threshold)
    msg = `[StrategicCompact] 편집 ${threshold}회 도달 — 작업 단계가 전환되는 시점이면 /compact 를 고려하세요`
  else if (count > threshold && (count - threshold) % 25 === 0)
    msg = `[StrategicCompact] 편집 ${count}회 — 오래된 컨텍스트가 많다면 /compact 하기 좋은 체크포인트입니다`

  if (msg) {
    console.error(msg)
    process.stdout.write(
      JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: msg } })
    )
  }
  process.exit(0)
})
