#!/usr/bin/env bash
# nblm-edu-materials.sh — ai-edu 교육 문서를 NotebookLM 교육 자료로 변환
#
# docs/1~9 + README + harness-claude-code/README 를 소스로 올리고
# 학습가이드·강의 슬라이드·퀴즈·플래시카드·오디오 개요(한국어)를 생성·다운로드한다.
#
# 사용:
#   ./scripts/nblm-edu-materials.sh setup       # 노트북 생성 + 소스 11종 업로드 + 한국어 설정
#   ./scripts/nblm-edu-materials.sh guide       # 학습 가이드(report) 생성+다운로드
#   ./scripts/nblm-edu-materials.sh slides      # 강의 슬라이드 생성+다운로드 (PDF+PPTX)
#   ./scripts/nblm-edu-materials.sh quiz        # 퀴즈 생성+다운로드 (Markdown+HTML)
#   ./scripts/nblm-edu-materials.sh flashcards  # 플래시카드 생성+다운로드 (Markdown+HTML)
#   ./scripts/nblm-edu-materials.sh audio       # 오디오 개요(팟캐스트) 생성+다운로드 (오래 걸림, ~20분)
#   ./scripts/nblm-edu-materials.sh all         # setup 부터 전부 (audio 포함)
#
# 사전 조건: notebooklm login (최초 1회, 브라우저 Google 로그인)
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
# 사내망 TLS 가로채기(Nongshim CA) 대응 — Python(httpx)이 시스템 신뢰 저장소를 쓰도록 지정
export SSL_CERT_FILE="${SSL_CERT_FILE:-/etc/ssl/certs/ca-certificates.crt}"

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$REPO_DIR/edu-materials"
ID_FILE="$REPO_DIR/.nblm-notebook-id"
TITLE="ai-edu AI 교육과정"

log() { echo "[nblm] $*"; }
fail() { echo "[nblm] 오류: $*" >&2; exit 1; }

command -v notebooklm >/dev/null 2>&1 || fail "notebooklm CLI가 없습니다 — uv tool install --system-certs 'notebooklm-py[browser]'"
notebooklm list >/dev/null 2>&1 || fail "인증이 필요합니다 — 먼저 'notebooklm login' 을 실행하세요"

mkdir -p "$OUT_DIR"

use_notebook() {
  [ -f "$ID_FILE" ] || fail "노트북이 없습니다 — 먼저 'setup' 을 실행하세요"
  notebooklm use "$(cat "$ID_FILE")" >/dev/null
}

cmd_setup() {
  if [ -f "$ID_FILE" ] && notebooklm use "$(cat "$ID_FILE")" >/dev/null 2>&1; then
    log "기존 노트북 재사용: $(cat "$ID_FILE")"
  else
    log "노트북 생성: $TITLE"
    local id
    id=$(notebooklm create "$TITLE" --use --json | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>console.log(JSON.parse(d).active_notebook_id||JSON.parse(d).notebook_id||""))')
    [ -n "$id" ] || fail "노트북 생성 실패"
    echo "$id" > "$ID_FILE"
    log "생성됨: $id"
  fi

  log "출력 언어를 한국어로 설정"
  notebooklm language set ko >/dev/null || log "경고: 언어 설정 실패 — 생성 시 --language ko 로 보완됩니다"

  log "소스 업로드 (11종 — 이미 있으면 NotebookLM이 중복 추가하므로 setup 재실행 주의)"
  local -a sources=(
    "README.md|0. ai-edu 개요"
    "docs/1.환경설정.md|1차시. 환경설정"
    "docs/2.PDCA-방법론.md|3차시. PDCA 방법론"
    "docs/3.폐쇄망-GPU서버-아키텍처.md|8차시. 폐쇄망·GPU서버"
    "docs/4.사이트별-컨벤션.md|5차시. 사이트별 컨벤션"
    "docs/5.로컬교육-설치-활용.md|2차시. 로컬교육 설치·활용"
    "docs/6.프론트엔드-템플릿-구조.md|4차시. 프론트엔드 템플릿"
    "docs/7.로컬-실행-하드웨어-사양.md|1차시. 하드웨어 사양"
    "docs/8.nkit-claude-code-프레임워크-분석.md|8차시. 실무 프레임워크 사례"
    "docs/9.AI-교육-커리큘럼.md|커리큘럼 (강사용)"
    "harness-claude-code/README.md|6차시. 실무 하네스 가이드"
  )
  for entry in "${sources[@]}"; do
    local file="${entry%%|*}" title="${entry#*|}"
    log "  + $title  ($file)"
    notebooklm source add "$REPO_DIR/$file" --title "$title" >/dev/null
  done
  log "setup 완료 — source list 로 확인: notebooklm source list"
}

cmd_guide() {
  use_notebook
  log "학습 가이드 생성 (report --format study-guide) ..."
  notebooklm generate report --format study-guide --language ko --wait \
    "8차시 AI 에이전트 코딩 교육 과정의 수강생용 학습 가이드. 차시 순서대로 핵심 개념·용어·실습 포인트를 정리"
  notebooklm download report "$OUT_DIR/학습가이드.md" --latest --force
  log "→ $OUT_DIR/학습가이드.md"
}

cmd_slides() {
  use_notebook
  log "강의 슬라이드 생성 (시간이 걸립니다) ..."
  notebooklm generate slide-deck --format presenter --language ko --wait \
    "8차시 커리큘럼(9.AI-교육-커리큘럼)을 따라 차시별 목표·핵심 개념·실습 안내를 담은 강의 슬라이드. 대상은 AI 보조 개발을 처음 배우는 사내 개발자"
  notebooklm download slide-deck "$OUT_DIR/강의슬라이드.pdf" --latest --force
  notebooklm download slide-deck "$OUT_DIR/강의슬라이드.pptx" --format pptx --latest --force
  log "→ $OUT_DIR/강의슬라이드.{pdf,pptx}"
}

cmd_quiz() {
  use_notebook
  log "퀴즈 생성 ..."
  notebooklm generate quiz --difficulty medium --quantity more --wait \
    "차시별 핵심 개념 확인 문제. PDCA 단계와 품질 게이트, 하네스 구성요소, 컨벤션, 훅, Continuous Learning 중심"
  notebooklm download quiz "$OUT_DIR/퀴즈.md" --format markdown --latest --force
  notebooklm download quiz "$OUT_DIR/퀴즈.html" --format html --latest --force
  log "→ $OUT_DIR/퀴즈.{md,html} (html은 브라우저에서 인터랙티브 풀이)"
}

cmd_flashcards() {
  use_notebook
  log "플래시카드 생성 ..."
  notebooklm generate flashcards --quantity more --wait \
    "핵심 용어·개념 복습 카드. 에이전트/커맨드/스킬/훅/컨벤션, PDCA 단계, 게이트 기준, 인스팅트 confidence 체계"
  notebooklm download flashcards "$OUT_DIR/플래시카드.md" --format markdown --latest --force
  notebooklm download flashcards "$OUT_DIR/플래시카드.html" --format html --latest --force
  log "→ $OUT_DIR/플래시카드.{md,html}"
}

cmd_audio() {
  use_notebook
  log "오디오 개요(팟캐스트) 생성 — 최대 20분 소요 ..."
  notebooklm generate audio --format deep-dive --length default --language ko --wait --timeout 1800 \
    "AI 에이전트 코딩 교육 과정 전체를 소개하는 대담. 왜 PDCA와 품질 게이트가 필요한지, 로컬과 클라우드 환경의 차이, 학습하는 하네스 개념을 비전공 청취자도 이해하게"
  notebooklm download audio "$OUT_DIR/과정소개-팟캐스트.mp3" --latest --force
  log "→ $OUT_DIR/과정소개-팟캐스트.mp3"
}

case "${1:-}" in
  setup)      cmd_setup ;;
  guide)      cmd_guide ;;
  slides)     cmd_slides ;;
  quiz)       cmd_quiz ;;
  flashcards) cmd_flashcards ;;
  audio)      cmd_audio ;;
  all)        cmd_setup; cmd_guide; cmd_slides; cmd_quiz; cmd_flashcards; cmd_audio ;;
  *)          grep '^#   ' "$0" | sed 's/^#   //'; exit 1 ;;
esac
