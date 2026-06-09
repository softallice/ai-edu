# 컨벤션 팩: react-typescript

> TypeScript + React 프론트엔드 사이트용 컨벤션.
> 상세 패턴: 하네스 스킬 `@skills/frontend-patterns`, `@skills/coding-standards` 참조.

## 언어 / 타입

- **TypeScript strict** 사용. `any` 금지(불가피하면 `unknown` + 좁히기). public API에 명시적 타입.
- 타입은 `type`/`interface`로 정의, 도메인 모델은 단일 출처(SSOT)로 관리.
- 입력 검증은 `zod` 등 스키마 기반 선호.

## 컴포넌트

- **함수형 컴포넌트 + 훅**만 사용(클래스 컴포넌트 금지).
- 한 파일 한 컴포넌트 원칙, 200~400줄 권장.
- props는 명시적 타입. 불필요한 prop drilling 회피(context/상태관리).
- 부수효과는 `useEffect`에 격리하고 의존성 배열 정확히 명시.
- 리스트 렌더링 `key`는 안정적 식별자(인덱스 금지).

## 상태 / 데이터

- 서버 상태와 클라이언트 상태 분리(예: React Query 등). 불변 업데이트.
- 파생 값은 렌더 중 계산 또는 `useMemo`(과용 금지).

## 파일 / 네이밍

| 항목 | 규칙 |
|------|------|
| 컴포넌트 파일 | `PascalCase.tsx` (예: `UserCard.tsx`) |
| 훅 | `useXxx.ts` (`camelCase`, `use` 접두사) |
| 유틸/일반 | `camelCase.ts` |
| 폴더 | 기능/도메인별 (`features/user/...`) |

## 품질

- 접근성(a11y): 의미론적 태그, label, 키보드 내비게이션.
- 에러 경계(Error Boundary)와 로딩/빈 상태 처리.
- 포맷: Prettier, 린트: ESLint. `console.log` 커밋 금지.
- 테스트: 컴포넌트/훅 단위 테스트(예: Testing Library), 핵심 플로우 E2E.

## 금지

- ❌ `any` 남용 / ❌ 클래스 컴포넌트 / ❌ 직접 DOM 조작(ref 외) / ❌ 인라인 매직 넘버 / ❌ 커밋된 `console.log`
