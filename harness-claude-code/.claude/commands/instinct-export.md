---
description: 인스팅트를 팀 공유용 JSON으로 내보내기
argument-hint: "[--min-confidence 0.7] [--output <file>]"
---

# Instinct Export

학습된 인스팅트를 JSON으로 내보내 팀원과 공유합니다.

## Implementation

```bash
CLI="${CLAUDE_PROJECT_DIR:-.}/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py"
[ -f "$CLI" ] || CLI="$HOME/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py"  # 전역 설치 fallback
python3 "$CLI" export $ARGUMENTS
```

기본 출력 경로와 내보낸 인스팅트 수를 보고하고, 팀원은 `/instinct-import <file>` 로
가져올 수 있다고 안내하세요. 공유 전 시크릿/내부 경로가 포함되지 않았는지 확인합니다.
