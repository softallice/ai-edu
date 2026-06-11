#!/usr/bin/env bash
# install.sh — ai-edu Claude Code 하네스를 실무 환경에 설치
#
#   ./install.sh                  # 전역 설치: ~/.claude 에 agents/commands/skills/hooks/conventions 설치
#                                 #   → 어떤 프로젝트 폴더에서 claude 를 실행해도 하네스가 적용됨
#   ./install.sh --project <dir>  # 특정 프로젝트에만 설치 (<dir>/.claude 복사)
#   ./install.sh --uninstall      # 전역 설치 제거 (매니페스트 기반 — 사용자 자체 설정은 보존)
#
# 안전 장치:
#   - 기존 ~/.claude/settings.json 은 백업 후 "병합"(merge-settings.cjs) — 덮어쓰지 않음
#   - 설치한 파일 목록을 매니페스트에 기록 → uninstall 시 그것만 제거
#   - 같은 이름의 기존 파일(우리 매니페스트에 없는)은 .bak 으로 백업 후 교체
set -euo pipefail

HARNESS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="${CLAUDE_DIR:-$HOME/.claude}"   # 테스트용 오버라이드 가능
MANIFEST="$CLAUDE_DIR/.ai-edu-harness-manifest.json"
VERSION="$(cat "$HARNESS_DIR/VERSION" 2>/dev/null || echo unknown)"

log() { echo "[install] $*"; }
fail() { echo "[install] 오류: $*" >&2; exit 1; }

command -v node >/dev/null 2>&1 || fail "node 가 필요합니다 (훅 실행용)"
command -v python3 >/dev/null 2>&1 || log "경고: python3 없음 — Continuous Learning v2 커맨드가 동작하지 않습니다"

# ── 파일 복사 (매니페스트 기록 + 기존 파일 백업) ─────────────────
copy_tracked() { # copy_tracked <src> <dst-rel-to-CLAUDE_DIR>
  local src="$1" rel="$2" dst="$CLAUDE_DIR/$2"
  mkdir -p "$(dirname "$dst")"
  if [ -e "$dst" ] && ! grep -qF "\"$rel\"" "$MANIFEST" 2>/dev/null; then
    cp "$dst" "$dst.bak"
    log "기존 파일 백업: $rel → $rel.bak"
  fi
  cp "$src" "$dst"
  FILES+=("$rel")
}

install_global() {
  log "전역 설치 시작 → $CLAUDE_DIR (하네스 v$VERSION)"
  mkdir -p "$CLAUDE_DIR"
  FILES=()

  for f in "$HARNESS_DIR"/.claude/agents/*.md;   do copy_tracked "$f" "agents/$(basename "$f")"; done
  for f in "$HARNESS_DIR"/.claude/commands/*.md; do copy_tracked "$f" "commands/$(basename "$f")"; done
  for f in "$HARNESS_DIR"/.claude/hooks/*.js;    do copy_tracked "$f" "hooks/$(basename "$f")"; done
  while IFS= read -r -d '' f; do
    copy_tracked "$f" "skills/${f#"$HARNESS_DIR"/.claude/skills/}"
  done < <(find "$HARNESS_DIR/.claude/skills" -type f -print0)
  while IFS= read -r -d '' f; do
    copy_tracked "$f" "conventions/${f#"$HARNESS_DIR"/conventions/}"
  done < <(find "$HARNESS_DIR/conventions" -type f -print0)
  copy_tracked "$HARNESS_DIR/config/pdca.config.json" "config/pdca.config.json"

  # 매니페스트 (settings 병합 기록은 merge-settings.cjs 가 추가)
  node -e '
    const fs = require("fs")
    const m = (() => { try { return JSON.parse(fs.readFileSync(process.argv[1], "utf8")) } catch { return {} } })()
    m.version = process.argv[2]
    m.installedAt = new Date().toISOString()
    m.files = JSON.parse(process.argv[3])
    fs.writeFileSync(process.argv[1], JSON.stringify(m, null, 2) + "\n")
  ' "$MANIFEST" "$VERSION" "$(printf '%s\n' "${FILES[@]}" | node -e 'console.log(JSON.stringify(require("fs").readFileSync(0,"utf8").trim().split("\n")))')"

  # settings.json 병합 (백업 후) — 훅 경로를 전역 설치 경로로 치환
  [ -f "$CLAUDE_DIR/settings.json" ] && cp "$CLAUDE_DIR/settings.json" "$CLAUDE_DIR/settings.json.pre-harness.bak"
  node "$HARNESS_DIR/scripts/merge-settings.cjs" merge \
    "$CLAUDE_DIR/settings.json" "$HARNESS_DIR/.claude/settings.json" \
    "$CLAUDE_DIR/hooks" "$MANIFEST"

  log "완료 — 파일 ${#FILES[@]}개 설치"
  echo
  echo "다음 단계:"
  echo "  1) 실무 레포에 컨벤션 적용:"
  echo "     node $HARNESS_DIR/scripts/apply-convention.cjs <레포> --from-home nexacro egov-backend"
  echo "  2) 해당 레포에서 claude 실행 → 에이전트/커맨드/훅/스킬 + 컨벤션 적용 확인 (/help)"
  echo "  3) 제거: ./install.sh --uninstall"
}

uninstall_global() {
  [ -f "$MANIFEST" ] || fail "매니페스트가 없습니다 ($MANIFEST) — 전역 설치 이력이 없습니다"
  log "전역 설치 제거 → $CLAUDE_DIR"
  node "$HARNESS_DIR/scripts/merge-settings.cjs" unmerge "$CLAUDE_DIR/settings.json" "$MANIFEST"
  node -e '
    const fs = require("fs"), path = require("path")
    const m = JSON.parse(fs.readFileSync(process.argv[1], "utf8"))
    const base = process.argv[2]
    let n = 0
    for (const rel of m.files || []) {
      const p = path.join(base, rel)
      try { fs.unlinkSync(p); n++ } catch {}
      try { fs.renameSync(p + ".bak", p) } catch {} // 설치 시 백업했던 사용자 파일 복원
    }
    // 빈 디렉터리 정리 (skills/conventions 하위)
    const sweep = (d) => { try {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) sweep(path.join(d, e.name))
      if (fs.readdirSync(d).length === 0) fs.rmdirSync(d)
    } catch {} }
    for (const top of ["skills", "conventions", "config"]) sweep(path.join(base, top))
    console.log(`[install] 파일 ${n}개 제거`)
  ' "$MANIFEST" "$CLAUDE_DIR"
  rm -f "$MANIFEST"
  log "제거 완료 (사용자 자체 설정·.bak 복원분은 보존)"
}

install_project() {
  local target="$1"
  [ -d "$target" ] || fail "프로젝트 경로가 아닙니다: $target"
  [ -e "$target/.claude" ] && fail "$target/.claude 가 이미 있습니다 — 수동으로 정리 후 재시도하세요"
  log "프로젝트 설치 → $target/.claude"
  cp -r "$HARNESS_DIR/.claude" "$target/.claude"
  mkdir -p "$target/.claude/config"
  cp "$HARNESS_DIR/config/pdca.config.json" "$target/.claude/config/" 2>/dev/null || true
  log "완료 — 컨벤션 적용: node $HARNESS_DIR/scripts/apply-convention.cjs $target <팩...>"
}

case "${1:-}" in
  --uninstall) uninstall_global ;;
  --project)   [ -n "${2:-}" ] || fail "--project <dir> 형식으로 지정하세요"; install_project "$2" ;;
  "")          install_global ;;
  *)           fail "알 수 없는 옵션: $1 (사용: install.sh [--project <dir>|--uninstall])" ;;
esac
