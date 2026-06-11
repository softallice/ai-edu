#!/usr/bin/env node
/**
 * Stop — 이번 응답에서 편집한 파일 일괄 포맷 + 타입체크. (ECC stop-format-typecheck.js 각색)
 *
 * post-edit-accumulator.js 가 기록한 목록을 읽어:
 *  1) prettier --write 를 프로젝트 루트별 1회 실행 (설치된 경우만, best-effort)
 *  2) ts/tsx 가 있으면 tsconfig 디렉터리별로 tsc --noEmit 1회 실행, 편집 파일 관련 오류만 보고
 * 누적 파일은 읽는 즉시 삭제해 반복 Stop 에서 이중 처리하지 않는다.
 */
'use strict'

const crypto = require('crypto')
const { execFileSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const TOTAL_BUDGET_MS = 240_000 // Stop 타임아웃(300s) 아래로 여유

// ⚠ post-edit-accumulator.js 의 accumFile() 과 반드시 동일하게 유지할 것
//   (prefix·세션 ID 해석이 어긋나면 누적 파일을 찾지 못해 조용히 무력화됨)
function accumFile(sessionId) {
  const raw = sessionId || process.env.CLAUDE_SESSION_ID || crypto.createHash('sha1').update(process.cwd()).digest('hex').slice(0, 12)
  const id = String(raw).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64)
  return path.join(os.tmpdir(), `harness-edited-${id}.txt`)
}

function findUp(startDir, marker) {
  let dir = startDir
  let depth = 0
  while (dir !== path.dirname(dir) && depth < 20) {
    if (fs.existsSync(path.join(dir, marker))) return dir
    dir = path.dirname(dir)
    depth++
  }
  return null
}

function formatBatch(projectRoot, files, timeoutMs) {
  try {
    execFileSync('npx', ['--no-install', 'prettier', '--write', ...files], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: timeoutMs,
    })
  } catch {
    /* prettier 미설치/실패 — 비차단 */
  }
}

function typecheckBatch(tsDir, editedFiles, timeoutMs) {
  let out = ''
  try {
    execFileSync('npx', ['--no-install', 'tsc', '--noEmit', '--pretty', 'false'], {
      cwd: tsDir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: timeoutMs,
    })
    return // 오류 없음
  } catch (err) {
    out = (err.stdout || '') + (err.stderr || '')
    if (!out.trim()) return // tsc 미설치/타임아웃 — 비차단
  }
  const lines = out.split('\n')
  for (const f of editedFiles) {
    const rel = path.relative(tsDir, f)
    const relevant = lines.filter((l) => l.includes(f) || l.includes(rel)).slice(0, 10)
    if (relevant.length) {
      console.error(`[Hook] TypeScript 오류: ${path.basename(f)}`)
      relevant.forEach((l) => console.error('  ' + l))
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
  const file = accumFile(sessionId)

  let list = ''
  try {
    list = fs.readFileSync(file, 'utf8')
  } catch {
    process.exit(0) // 이번 응답에 편집 없음
  }
  try {
    fs.unlinkSync(file)
  } catch {
    /* best-effort */
  }

  const files = [...new Set(list.split('\n').map((l) => l.trim()).filter(Boolean))]
    .map((f) => path.resolve(f))
    .filter((f) => fs.existsSync(f))
  if (files.length === 0) process.exit(0)

  // 프로젝트 루트(package.json)별 포맷 배치
  const byRoot = new Map()
  for (const f of files) {
    const root = findUp(path.dirname(f), 'package.json') || path.dirname(f)
    if (!byRoot.has(root)) byRoot.set(root, [])
    byRoot.get(root).push(f)
  }
  // tsconfig 디렉터리별 타입체크 배치
  const byTsDir = new Map()
  for (const f of files) {
    if (!/\.(ts|tsx)$/.test(f)) continue
    const tsDir = findUp(path.dirname(f), 'tsconfig.json')
    if (!tsDir) continue
    if (!byTsDir.has(tsDir)) byTsDir.set(tsDir, [])
    byTsDir.get(tsDir).push(f)
  }

  const batches = byRoot.size + byTsDir.size
  const perBatchMs = batches > 0 ? Math.floor(TOTAL_BUDGET_MS / batches) : 60_000

  for (const [root, batch] of byRoot) formatBatch(root, batch, perBatchMs)
  for (const [tsDir, batch] of byTsDir) typecheckBatch(tsDir, batch, perBatchMs)
  process.exit(0)
})
