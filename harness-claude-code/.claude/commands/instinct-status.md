---
description: 학습된 인스팅트 현황을 도메인별 confidence 막대로 표시
---

# Instinct Status

Continuous Learning v2 의 인스팅트 현황을 보여줍니다.

## Implementation

```bash
CLI="${CLAUDE_PROJECT_DIR:-.}/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py"
[ -f "$CLI" ] || CLI="$HOME/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py"  # 전역 설치 fallback
python3 "$CLI" status
```

CLI 출력(도메인별 그룹, confidence 막대, 관측 통계)을 그대로 보여주고,
승격 후보(confidence 0.8 이상)가 있으면 `/evolve` 실행을 제안하세요.

인스팅트가 0개라면: observe 훅이 관측을 쌓는 중이며, `/learn` 으로 수동 저장하거나
`observer` 에이전트(Task 도구)로 관측 데이터를 분석할 수 있다고 안내하세요.
