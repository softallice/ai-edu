#!/usr/bin/env node
/**
 * PostToolUse(*) — Continuous Learning v2 관측 캡처. (ECC observe.sh 단순화 각색)
 *
 * 도구 사용 이벤트를 instinct-cli.py 와 같은 저장소 규약
 * (${CLV2_HOMUNCULUS_DIR | $XDG_DATA_HOME/ecc-homunculus | ~/.local/share/ecc-homunculus})
 * 의 전역 observations.jsonl 에 누적한다. observer 에이전트가 이 파일을 분석해
 * 인스팅트를 생성한다(/learn 안내 참고).
 *
 * ECC 원본과의 차이(교육 하네스 단순화):
 *  - 백그라운드 옵저버 데몬·SIGUSR1 스로틀링 없음 — 분석은 observer 에이전트를 수동 호출
 *  - 프로젝트 해시 스코프 없음 — 전역 파일에 project_name 필드만 기록
 * 비활성화: 환경변수 HARNESS_SKIP_OBSERVE=1
 */
'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')

const MAX_FILE_MB = 10
// 구분자에 \\ 포함: JSON.stringify 된 문자열은 따옴표가 \" 로 이스케이프되므로
const SECRET_RE = /(api[_-]?key|token|secret|password|authorization|credentials?|auth)(["'\\\s:=]+)([A-Za-z]+\s+)?([A-Za-z0-9_\-/.+=]{8,})/gi

function homunculusDir() {
  const override = process.env.CLV2_HOMUNCULUS_DIR
  if (override && path.isAbsolute(override)) return override
  const xdg = process.env.XDG_DATA_HOME
  if (xdg && path.isAbsolute(xdg)) return path.join(xdg, 'ecc-homunculus')
  return path.join(os.homedir(), '.local', 'share', 'ecc-homunculus')
}

function scrub(v) {
  if (v == null) return null
  return String(v).replace(SECRET_RE, (_, k, sep, scheme) => k + sep + (scheme || '') + '[REDACTED]')
}

let raw = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (c) => {
  if (raw.length < 1024 * 1024) raw += c
})
process.stdin.on('end', () => {
  if (process.env.HARNESS_SKIP_OBSERVE === '1') process.exit(0)
  let input
  try {
    input = JSON.parse(raw || '{}')
  } catch {
    process.exit(0)
  }
  // 서브에이전트(자동) 세션은 관측하지 않음 — 자기 관측 루프 방지
  if (input.agent_id) process.exit(0)

  const dir = homunculusDir()
  const file = path.join(dir, 'observations.jsonl')
  try {
    fs.mkdirSync(dir, { recursive: true })
    // 파일이 커지면 아카이브로 회전
    try {
      if (fs.statSync(file).size > MAX_FILE_MB * 1024 * 1024) {
        const archiveDir = path.join(dir, 'observations.archive')
        fs.mkdirSync(archiveDir, { recursive: true })
        fs.renameSync(file, path.join(archiveDir, `observations-${Date.now()}.jsonl`))
      }
    } catch {
      /* 파일 없음 */
    }

    const toolInput = input.tool_input ? JSON.stringify(input.tool_input).slice(0, 5000) : null
    const toolOutput = input.tool_response != null ? JSON.stringify(input.tool_response).slice(0, 5000) : null
    const obs = {
      timestamp: new Date().toISOString(),
      event: 'tool_complete',
      tool: input.tool_name || 'unknown',
      session: input.session_id || 'unknown',
      project_id: 'global',
      project_name: path.basename(input.cwd || process.cwd()),
      input: scrub(toolInput),
      output: scrub(toolOutput),
    }
    fs.appendFileSync(file, JSON.stringify(obs) + '\n', 'utf8')
  } catch {
    /* 관측 실패가 작업을 막지 않도록 무시 */
  }
  process.exit(0)
})
