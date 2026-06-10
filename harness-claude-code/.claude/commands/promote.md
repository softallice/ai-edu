---
description: Promote project instincts to global scope
---
> 이 작업은 **build** 서브에이전트에 위임하세요(Task 도구로 `build` 호출).

# Promote Command

Promote instincts in continuous-learning-v2: $ARGUMENTS

## Your Task

Run:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" promote $ARGUMENTS
```

If `CLAUDE_PLUGIN_ROOT` is unavailable, use:

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py promote $ARGUMENTS
```

