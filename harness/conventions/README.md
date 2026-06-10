# 사이트별 컨벤션 시스템

여러 사이트가 서로 다른 코딩 컨벤션(React-TS / Nexacro / 전자정부 백엔드 등)을 쓸 때, **하네스는 공통 베이스**로 두고 **각 사이트가 필요한 컨벤션 팩만 골라 적용**하는 구조입니다.

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

- **하네스 = 글로벌 베이스**: 에이전트·커맨드·PDCA·common 컨벤션을 모든 사이트가 공유.
  - 권장: 하네스를 `~/.config/opencode/`에 설치(또는 심볼릭 링크)해 전역 베이스로 사용.
- **사이트 레포 = 프로젝트 오버레이**: 각 사이트 레포 루트에 작은 `opencode.json` + `AGENTS.md`를 두고, 필요한 컨벤션 팩을 `instructions`로 가리킴.
  - OpenCode는 cwd에서 위로 올라가며 config/AGENTS.md를 **머지**하므로, 사이트 레포에서 `opencode`를 실행하면 글로벌 베이스 + 해당 사이트 팩이 함께 적용됨.

## 사이트 오버레이 적용 (3가지 방법)

### 1) 생성기 명령 (권장, 가장 쉬움)
OpenCode 안에서:
```
/apply-convention <site-repo-path> nexacro egov-backend
/apply-convention <site-repo-path> --profile siteB
```
→ 해당 레포에 `opencode.json`(instructions에 팩 경로) + `AGENTS.md`(요약)를 생성.

### 2) 스크립트 직접 실행
```bash
node <harness>/scripts/apply-convention.cjs <site-repo-path> nexacro egov-backend
node <harness>/scripts/apply-convention.cjs <site-repo-path> --profile siteB
```

### 3) 수동 (overlay 직접 작성)
사이트 레포 루트 `opencode.json`:
```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": [
    "<harness>/conventions/common/CONVENTION.md",
    "<harness>/conventions/nexacro/CONVENTION.md",
    "<harness>/conventions/egov-backend/CONVENTION.md"
  ]
}
```

## 프로파일

`profiles.json`에 사이트별 팩 조합을 등록해 재사용합니다. 예시는 해당 파일 참조.

## 새 컨벤션 팩 추가

1. `conventions/<stack>/CONVENTION.md` 작성(이 폴더의 기존 팩 형식 참고).
2. 필요한 사이트의 overlay `instructions` 또는 `profiles.json`에 추가.
3. (선택) 상세 패턴은 `skills/`의 관련 스킬을 `@skills/...`로 참조.

## PDCA·에이전트 연동

오케스트레이터/서브에이전트는 작업 시작 시 활성 컨벤션 팩을 컨텍스트로 받습니다. PDCA `design/do/check` 단계는 해당 사이트 팩을 설계·구현·품질 게이트 기준으로 사용합니다(자세한 내용은 `prompts/agents/pdca-orchestrator.txt`).
