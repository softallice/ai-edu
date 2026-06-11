#!/usr/bin/env node
/**
 * Stop — git 변경 파일의 console.log 탐지 경고. (ECC check-console-log.js 각색)
 *
 * 응답이 끝날 때마다 git 작업트리에서 변경된 JS/TS 파일을 훑어 console.log 가
 * 남아 있으면 경고한다(비차단). 테스트/설정/스크립트 파일은 제외.
 */
'use strict'

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const EXCLUDED = [/\.test\.[jt]sx?$/, /\.spec\.[jt]sx?$/, /\.config\.[jt]s$/, /scripts\//, /__tests__\//, /__mocks__\//, /\.claude\/hooks\//]

function gitModified() {
  try {
    // git diff 는 저장소 루트 기준 경로를 반환한다. 하네스가 저장소의 하위
    // 디렉터리일 수 있으므로(예: ai-edu/harness-claude-code) 루트로 절대화한다.
    const root = execSync('git rev-parse --show-toplevel', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
    return execSync('git diff --name-only HEAD', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
      .split('\n')
      .filter((f) => /\.[jt]sx?$/.test(f))
      .map((f) => path.join(root, f))
  } catch {
    return []
  }
}

let raw = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (c) => (raw += c))
process.stdin.on('end', () => {
  let found = false
  for (const f of gitModified().filter((f) => fs.existsSync(f) && !EXCLUDED.some((p) => p.test(f)))) {
    try {
      if (fs.readFileSync(f, 'utf8').includes('console.log')) {
        console.error(`[Hook] 경고: ${f} 에 console.log 가 있습니다`)
        found = true
      }
    } catch {
      /* 무시 */
    }
  }
  if (found) console.error('[Hook] 커밋 전에 console.log 를 제거하세요')
  process.exit(0)
})
