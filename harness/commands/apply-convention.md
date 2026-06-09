---
description: Scaffold a site convention overlay (opencode.json + AGENTS.md) for a target repo
---

# /apply-convention

대상 사이트 레포에 컨벤션 overlay를 생성해, 그 레포에서 OpenCode를 실행할 때 하네스의 선택된 컨벤션 팩이 적용되도록 합니다.

## 사용법

```
/apply-convention <site-repo-path> <pack...>
/apply-convention <site-repo-path> --profile <name>
```

- 사용 가능한 팩: `react-typescript`, `nexacro`, `egov-backend` (`common`은 항상 자동 포함)
- 프로파일은 `conventions/profiles.json` 참조 (예: `nexacro-egov`, `react-site`, `egov-only`)
- 이미 파일이 있으면 `--force`로 덮어쓰기

## 동작

`scripts/apply-convention.cjs`를 실행합니다.

1. 대상 레포에 `opencode.json` 생성 — `instructions`가 하네스 `conventions/<pack>/CONVENTION.md`들을 가리킴(`common` 우선).
2. 대상 레포에 `AGENTS.md` 생성 — 적용 팩 요약.

실행 예:
```bash
node scripts/apply-convention.cjs $ARGUMENTS
```

> 전제: 하네스가 글로벌 베이스(`~/.config/opencode/` 설치 또는 링크)로 구성되어 있어야 사이트 레포에서 에이전트·커맨드·PDCA + 컨벤션이 함께 머지됩니다. 자세한 내용은 `conventions/README.md`.

대상/팩: $ARGUMENTS
