---
description: Scaffold a site convention overlay (CLAUDE.md) for a target repo
argument-hint: <site-repo-path> <pack...|--profile name>
---
# /apply-convention

대상 사이트 레포에 컨벤션 overlay(`CLAUDE.md`)를 생성해, 그 레포에서 `claude`를 실행할 때 하네스의 선택된 컨벤션 팩이 로드되도록 합니다.

## 사용법

```
/apply-convention <site-repo-path> <pack...>
/apply-convention <site-repo-path> --profile <name>
```

- 사용 가능한 팩: `react-typescript`, `spring-boot`, `nexacro`, `egov-backend` (`common`은 항상 자동 포함)
- 프로파일은 `conventions/profiles.json` 참조 (예: `react-site`, `spring-boot`, `react-spring`, `nexacro-egov`, `egov-only`)
- 이미 `CLAUDE.md`가 있으면 `--force`로 덮어쓰기

## 동작

`scripts/apply-convention.cjs`를 실행합니다.

1. 대상 레포에 `CLAUDE.md` 생성 — 선택한 팩(`common` 우선)을 Claude Code `@import`로 가리킴.
2. 해당 레포에서 `claude` 실행 시, `@import`된 컨벤션 팩이 컨텍스트에 로드되어 코드 생성·리뷰·PDCA에 적용됩니다.

실행 예:
```bash
node scripts/apply-convention.cjs $ARGUMENTS
```

> 참고: Claude Code는 cwd→상위→`~/.claude`의 설정을 머지합니다. 이 하네스를 글로벌(`~/.claude`)에 두면 사이트 레포에서 에이전트·커맨드·스킬 + 컨벤션이 함께 적용됩니다. 자세한 내용은 `conventions/README.md`.

대상/팩: $ARGUMENTS
