---
description: 인스팅트 클러스터링 분석 — 성숙한 패턴을 스킬/커맨드 초안으로 진화
argument-hint: "[--generate]"
---

# Evolve Instincts

축적된 인스팅트를 클러스터링해 스킬/커맨드로 진화시킬 후보를 찾습니다.

## Implementation

```bash
CLI="${CLAUDE_PROJECT_DIR:-.}/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py"
[ -f "$CLI" ] || CLI="$HOME/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py"  # 전역 설치 fallback
python3 "$CLI" evolve $ARGUMENTS
```

## What to Do

1. CLI가 출력한 클러스터(같은 도메인, 유사 트리거의 인스팅트 묶음)를 검토합니다.
2. confidence 평균 0.7 이상이고 인스팅트 3개 이상인 클러스터는 스킬로 만들 가치가 있습니다.
3. `--generate` 가 주어졌으면 `~/.local/share/ecc-homunculus/evolved/` 의 초안을 읽고,
   사용자 확인 후 `.claude/skills/<name>/SKILL.md` 로 정식 승격합니다.
4. 결과 요약: 클러스터 수, 승격 후보, 다음 단계 제안.
