#!/usr/bin/env node
/**
 * apply-convention.cjs  (Claude Code 버전)
 *
 * 사이트 레포에 컨벤션 overlay(CLAUDE.md)를 생성한다.
 * 하네스의 conventions/<pack>/CONVENTION.md 들을 Claude Code의 @import 로 가리킨다.
 * (OpenCode 버전은 opencode.json + AGENTS.md 를 생성 — 여기서는 CLAUDE.md 단일 파일.)
 *
 * 사용법:
 *   node scripts/apply-convention.cjs <site-repo-path> <pack...> [--force]
 *   node scripts/apply-convention.cjs <site-repo-path> --profile <name> [--force]
 *
 * 예:
 *   node scripts/apply-convention.cjs ../sites/portal react-typescript
 *   node scripts/apply-convention.cjs ../sites/api spring-boot
 *   node scripts/apply-convention.cjs ../sites/app --profile react-spring
 */

"use strict"

const fs = require("fs")
const path = require("path")

const HARNESS_DIR = path.resolve(__dirname, "..")
const CONVENTIONS_DIR = path.join(HARNESS_DIR, "conventions")
const ALWAYS = "common" // 항상 포함되는 공통 팩

function fail(msg) {
  console.error(`[apply-convention] ${msg}`)
  process.exit(1)
}

function listPacks() {
  return fs
    .readdirSync(CONVENTIONS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
}

function loadProfiles() {
  const p = path.join(CONVENTIONS_DIR, "profiles.json")
  if (!fs.existsSync(p)) return {}
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")).profiles || {}
  } catch (e) {
    fail(`profiles.json 파싱 실패: ${e.message}`)
  }
}

function parseArgs(argv) {
  const args = argv.slice(2)
  if (args.length < 2) {
    fail(
      "사용법: node scripts/apply-convention.cjs <site-repo-path> <pack...|--profile name> [--force]"
    )
  }
  const sitePath = path.resolve(args[0])
  const force = args.includes("--force")
  let packs = []

  const profIdx = args.indexOf("--profile")
  if (profIdx >= 0) {
    const name = args[profIdx + 1]
    if (!name) fail("--profile 뒤에 프로파일 이름이 필요합니다.")
    const profiles = loadProfiles()
    if (!profiles[name]) fail(`알 수 없는 프로파일: ${name} (가능: ${Object.keys(profiles).join(", ")})`)
    packs = profiles[name].packs || []
  } else {
    packs = args.slice(1).filter((a) => !a.startsWith("--"))
  }

  return { sitePath, packs, force }
}

function relFromSite(sitePath, target) {
  // overlay가 다른 경로에서도 읽히도록 상대경로 우선
  const rel = path.relative(sitePath, target)
  return rel.split(path.sep).join("/")
}

function main() {
  const { sitePath, packs, force } = parseArgs(process.argv)

  if (!fs.existsSync(sitePath) || !fs.statSync(sitePath).isDirectory()) {
    fail(`사이트 경로가 디렉터리가 아닙니다: ${sitePath}`)
  }

  // common 자동 포함 + 중복 제거 + 순서 보장(common 먼저)
  const available = new Set(listPacks())
  const requested = packs.filter((p) => p !== ALWAYS)
  const unknown = requested.filter((p) => !available.has(p))
  if (unknown.length) {
    fail(`알 수 없는 팩: ${unknown.join(", ")} (가능: ${[...available].join(", ")})`)
  }
  const finalPacks = [ALWAYS, ...requested]

  const imports = finalPacks.map((p) =>
    relFromSite(sitePath, path.join(CONVENTIONS_DIR, p, "CONVENTION.md"))
  )

  const claudePath = path.join(sitePath, "CLAUDE.md")
  if (fs.existsSync(claudePath) && !force) {
    fail(`이미 CLAUDE.md 가 존재합니다. 덮어쓰려면 --force 를 붙이세요.\n  ${claudePath}`)
  }

  const body = [
    "# 사이트 컨벤션 (ai-edu Claude Code 하네스)",
    "",
    `이 레포에는 다음 컨벤션 팩이 적용됩니다: **${finalPacks.join(", ")}**`,
    "",
    "코드 생성·리뷰·PDCA 전 단계에서 아래 팩의 규칙을 우선 적용하세요.",
    "아래 `@import` 로 하네스의 컨벤션 팩을 이 컨텍스트에 로드합니다:",
    "",
    ...imports.map((i) => `@${i}`),
    "",
  ].join("\n")
  fs.writeFileSync(claudePath, body)

  console.log("[apply-convention] 생성 완료")
  console.log(`  site:   ${sitePath}`)
  console.log(`  packs:  ${finalPacks.join(", ")}`)
  console.log(`  files:  CLAUDE.md`)
  console.log(`  → 해당 레포에서 'claude' 실행 시 컨벤션이 로드됩니다.`)
}

main()
