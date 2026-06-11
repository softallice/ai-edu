#!/usr/bin/env node
/**
 * PreToolUse(Write|Edit|MultiEdit) 가드 — 린터/포매터 설정 보호. (ECC config-protection.js 각색)
 *
 * 에이전트가 검사를 통과시키려고 코드 대신 설정을 약화시키는 행동을 차단해
 * "소스를 고치라"는 방향으로 유도한다.
 *
 * exit 0 = 허용(설정 파일 아님 / 최초 생성) · exit 2 = 차단(기존 설정 수정)
 */
'use strict'

const fs = require('fs')
const path = require('path')

const PROTECTED_FILES = new Set([
  // ESLint (legacy + v9 flat config)
  '.eslintrc', '.eslintrc.js', '.eslintrc.cjs', '.eslintrc.json', '.eslintrc.yml', '.eslintrc.yaml',
  'eslint.config.js', 'eslint.config.mjs', 'eslint.config.cjs', 'eslint.config.ts',
  // Prettier
  '.prettierrc', '.prettierrc.js', '.prettierrc.cjs', '.prettierrc.json', '.prettierrc.yml', '.prettierrc.yaml',
  'prettier.config.js', 'prettier.config.cjs', 'prettier.config.mjs',
  // Biome / Stylelint / Markdownlint
  'biome.json', 'biome.jsonc',
  '.stylelintrc', '.stylelintrc.json', '.stylelintrc.yml',
  '.markdownlint.json', '.markdownlint.yaml', '.markdownlintrc',
  // Java (교육 스택: Spring Boot/Gradle)
  'checkstyle.xml', '.editorconfig',
])

let raw = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (c) => (raw += c))
process.stdin.on('end', () => {
  let filePath = ''
  try {
    filePath = JSON.parse(raw || '{}').tool_input?.file_path || ''
  } catch {
    process.exit(0)
  }
  if (!filePath) process.exit(0)

  const basename = path.basename(filePath)
  if (!PROTECTED_FILES.has(basename)) process.exit(0)

  // 최초 생성은 허용 — 약화시킬 기존 설정이 없다. lstat으로 dangling symlink도
  // "존재"로 취급하고, ENOENT 외의 오류(EACCES 등)는 fail-closed로 차단 유지.
  try {
    fs.lstatSync(filePath)
  } catch (err) {
    if (err && err.code === 'ENOENT') process.exit(0)
  }

  console.error(
    `차단: ${basename} 수정은 금지됩니다. 설정을 약화시키지 말고 린터/포매터 규칙을 만족하도록 소스 코드를 고치세요. ` +
      '정당한 설정 변경이라면 사용자에게 확인을 받으세요.'
  )
  process.exit(2)
})
