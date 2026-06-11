#!/usr/bin/env node
/**
 * merge-settings.cjs — 하네스 설정을 사용자 ~/.claude/settings.json 에 안전 병합/해제.
 *
 * 사용:
 *   node merge-settings.cjs merge   <target-settings> <source-settings> <hooks-prefix> <manifest>
 *   node merge-settings.cjs unmerge <target-settings> <manifest>
 *
 * merge:
 *   - source 의 permissions.allow/deny 중 target 에 없는 항목만 추가
 *   - source 의 hooks 명령 경로를 "$CLAUDE_PROJECT_DIR/.claude/hooks" → <hooks-prefix> 로 치환 후,
 *     동일 명령이 없을 때만 추가
 *   - 추가한 항목을 manifest 에 기록 (unmerge 시 정확히 그것만 제거)
 *   - model 등 사용자 기존 설정은 건드리지 않음 (target 에 model 이 없을 때만 source 값 채움)
 * unmerge:
 *   - manifest 에 기록된 항목만 제거. 사용자가 직접 추가한 설정은 보존.
 */
'use strict'

const fs = require('fs')

function readJson(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'))
  } catch {
    return fallback
  }
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n')
}

const [, , mode, targetPath, a, b, c] = process.argv

if (mode === 'merge') {
  const [sourcePath, hooksPrefix, manifestPath] = [a, b, c]
  const target = readJson(targetPath, {})
  const source = readJson(sourcePath, null)
  if (!source) {
    console.error(`[merge-settings] source 를 읽지 못했습니다: ${sourcePath}`)
    process.exit(1)
  }

  const added = { allow: [], deny: [], hooks: [] }

  if (!target.$schema && source.$schema) target.$schema = source.$schema
  if (!target.model && source.model) target.model = source.model

  // permissions 합집합 (기존 항목 보존, 새 항목만 추가)
  target.permissions = target.permissions || {}
  for (const key of ['allow', 'deny']) {
    const cur = new Set(target.permissions[key] || [])
    for (const item of source.permissions?.[key] || []) {
      if (!cur.has(item)) {
        cur.add(item)
        added[key].push(item)
      }
    }
    target.permissions[key] = [...cur]
  }

  // hooks: 명령 경로를 전역 설치 경로로 치환 후, 동일 명령이 없을 때만 추가
  target.hooks = target.hooks || {}
  const existingCmds = new Set()
  for (const entries of Object.values(target.hooks)) {
    for (const e of entries || []) for (const h of e.hooks || []) existingCmds.add(h.command)
  }
  for (const [event, entries] of Object.entries(source.hooks || {})) {
    target.hooks[event] = target.hooks[event] || []
    for (const entry of entries) {
      const rewritten = {
        ...entry,
        hooks: (entry.hooks || []).map((h) => ({
          ...h,
          command: h.command.replaceAll('$CLAUDE_PROJECT_DIR/.claude/hooks', hooksPrefix),
        })),
      }
      const newCmds = rewritten.hooks.map((h) => h.command).filter((cmd) => !existingCmds.has(cmd))
      if (newCmds.length === 0) continue
      rewritten.hooks = rewritten.hooks.filter((h) => newCmds.includes(h.command))
      target.hooks[event].push(rewritten)
      for (const cmd of newCmds) {
        existingCmds.add(cmd)
        added.hooks.push({ event, command: cmd })
      }
    }
  }

  writeJson(targetPath, target)
  const manifest = readJson(manifestPath, {})
  manifest.settings = added
  writeJson(manifestPath, manifest)
  console.log(
    `[merge-settings] 병합 완료 — allow +${added.allow.length}, deny +${added.deny.length}, hooks +${added.hooks.length}`
  )
} else if (mode === 'unmerge') {
  const manifestPath = a
  const target = readJson(targetPath, null)
  const manifest = readJson(manifestPath, {})
  const added = manifest.settings || { allow: [], deny: [], hooks: [] }
  if (!target) process.exit(0)

  if (target.permissions) {
    for (const key of ['allow', 'deny']) {
      const remove = new Set(added[key] || [])
      if (target.permissions[key]) target.permissions[key] = target.permissions[key].filter((i) => !remove.has(i))
    }
  }
  const removeCmds = new Set((added.hooks || []).map((h) => h.command))
  for (const [event, entries] of Object.entries(target.hooks || {})) {
    target.hooks[event] = entries
      .map((e) => ({ ...e, hooks: (e.hooks || []).filter((h) => !removeCmds.has(h.command)) }))
      .filter((e) => e.hooks.length > 0)
    if (target.hooks[event].length === 0) delete target.hooks[event]
  }
  writeJson(targetPath, target)
  console.log(`[merge-settings] 해제 완료 — hooks -${removeCmds.size}`)
} else {
  console.error('사용: merge-settings.cjs merge <target> <source> <hooks-prefix> <manifest> | unmerge <target> <manifest>')
  process.exit(1)
}
