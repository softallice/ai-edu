# 사이트별 컨벤션 시스템 (Claude Code판)

여러 사이트가 서로 다른 코딩 컨벤션(React-TS / Spring Boot / Nexacro / 전자정부 백엔드 등)을 쓸 때, **하네스는 공통 베이스**로 두고 **각 사이트가 필요한 컨벤션 팩만 골라 적용**하는 구조입니다.

> 이 문서는 손으로 관리합니다(`generate-from-opencode.cjs`가 덮어쓰지 않음). OpenCode판 사용법은 `../harness/conventions/README.md` 참고.

## 구성

```
conventions/
  common/CONVENTION.md            # 전 사이트 공통 (항상 로드)
  react-typescript/CONVENTION.md  # TS + React (TanStack/shadcn 스택)
  spring-boot/CONVENTION.md       # 모던 Spring Boot REST + JPA
  nexacro/CONVENTION.md           # Nexacro N
  egov-backend/CONVENTION.md      # 전자정부(EgovFramework) + MyBatis
  profiles.json                   # 사이트 → 팩 매핑
```

## 적용 모델 (배치)

- **하네스 = 공통 베이스**: 에이전트·커맨드·스킬·PDCA를 이 폴더(`harness-claude-code/`)에서 제공. `CLAUDE.md`가 `@conventions/common/CONVENTION.md`를 항상 import.
- **사이트 레포 = 오버레이**: 각 사이트 레포 루트에 `CLAUDE.md`를 생성하고, 필요한 컨벤션 팩을 `@import`로 가리킴. 해당 레포에서 `claude`를 실행하면 그 컨벤션이 로드됩니다.

## 사이트 오버레이 적용 (3가지 방법)

### 1) 커맨드 (권장, 가장 쉬움)
Claude Code 안에서:
```
/apply-convention <site-repo-path> nexacro egov-backend
/apply-convention <site-repo-path> --profile nexacro-egov
```
→ 해당 레포에 컨벤션 팩 `@import`를 담은 `CLAUDE.md`를 생성.

### 2) 스크립트 직접 실행
```bash
node <harness>/scripts/apply-convention.cjs <site-repo-path> nexacro egov-backend
node <harness>/scripts/apply-convention.cjs <site-repo-path> --profile nexacro-egov
```

### 3) 수동 (overlay 직접 작성)
사이트 레포 루트 `CLAUDE.md`:
```markdown
# 사이트 컨벤션

@../harness-claude-code/conventions/common/CONVENTION.md
@../harness-claude-code/conventions/nexacro/CONVENTION.md
@../harness-claude-code/conventions/egov-backend/CONVENTION.md
```
(경로는 사이트 레포 기준 상대경로 — `apply-convention.cjs`가 자동 계산해 줍니다.)

## 프로파일

`profiles.json`에 사이트별 팩 조합을 등록해 재사용합니다. 예시는 해당 파일 참조.

## 새 컨벤션 팩 추가

1. `conventions/<stack>/CONVENTION.md` 작성(이 폴더의 기존 팩 형식 참고).
2. 필요한 사이트의 overlay `CLAUDE.md` 또는 `profiles.json`에 추가.
3. (선택) 상세 패턴은 `.claude/skills/`의 관련 스킬을 참조.

## PDCA·에이전트 연동

오케스트레이터/서브에이전트는 작업 시작 시 활성 컨벤션 팩을 컨텍스트로 받습니다. PDCA `design/do/check` 단계는 해당 사이트 팩을 설계·구현·품질 게이트 기준으로 사용합니다(`.claude/agents/pdca-orchestrator.md`).
