#!/usr/bin/env node
/**
 * PreToolUse(Bash) 가드.
 * - git hook 우회(--no-verify) 차단 (exit 2 → 도구 실행 중단, stderr가 모델에 전달됨)
 * - 위험한 광역 삭제(rm -rf /, rm -rf ~) 차단
 * 입력: stdin JSON { tool_input: { command } }
 */
let data = ''
process.stdin.on('data', (c) => (data += c))
process.stdin.on('end', () => {
  let cmd = ''
  try {
    cmd = JSON.parse(data || '{}').tool_input?.command || ''
  } catch {
    process.exit(0)
  }

  if (/(^|\s)--no-verify(\s|$)/.test(cmd)) {
    console.error('차단: git hook 우회(--no-verify)는 금지됩니다. pre-commit/commit-msg 게이트를 통과시키세요.')
    process.exit(2)
  }
  // rm 의 재귀 플래그는 순서·분리 표기가 다양함(-rf, -fr, -r -f, --recursive) → 플래그 묶음을 잡아 r 포함 여부로 판정
  const rmMatch = cmd.match(/\brm\s+((?:-{1,2}\S+\s+)*)(\/|~|\$HOME)(\s|$)/)
  if (rmMatch && /(^|\s)-\w*[rR]|--recursive/.test(rmMatch[1])) {
    console.error('차단: 광역 삭제(rm -rf /, ~)는 금지됩니다.')
    process.exit(2)
  }
  process.exit(0)
})
