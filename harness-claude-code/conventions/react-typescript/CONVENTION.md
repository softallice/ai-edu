# 컨벤션 팩: react-typescript

> TypeScript + React 프론트엔드 사이트용 컨벤션.
> **기준 템플릿**: `ai-edu/frontend` (shadcn-admin 기반 — Vite + TanStack + shadcn/ui).
> 상세 패턴: `@skills/frontend-patterns`, `@skills/coding-standards` 참조.

## 기준 스택

Vite · TypeScript(strict) · **TanStack Router**(파일 기반) · **TanStack Query**(서버 상태) · **TanStack Table** · **shadcn/ui**(Radix + Tailwind v4) · **zustand**(클라이언트 상태) · **react-hook-form + zod**(폼/검증). 새 코드는 이 스택을 따릅니다.

## 언어 / 타입

- **TypeScript strict**. `any` 금지(불가피하면 `unknown` + 좁히기). `noUnusedLocals`/`noUnusedParameters` 준수.
- 타입 import는 **inline type-import**로: `import { type Task } from './schema'` (ESLint `consistent-type-imports` 강제).
- 도메인 모델은 **zod 스키마를 단일 출처(SSOT)**로 두고 `z.infer`로 타입 파생.
- 경로 별칭 **`@/`** = `src/` (예: `@/components/ui/button`). 같은 기능 내부는 상대경로(`./`, `../`).

## 파일 / 네이밍 (중요)

| 항목 | 규칙 | 예 |
|------|------|-----|
| **모든 파일** | **kebab-case** | `users-action-dialog.tsx`, `theme-provider.tsx`, `auth-store.ts` |
| 컴포넌트 export | **PascalCase named export** | `export function UsersTable() {}` |
| 훅 파일/이름 | `use-xxx.ts(x)` / `useXxx` | `use-mobile.tsx` → `useMobile` |
| 기능 내부 컴포넌트 | **도메인 접두사** | `tasks-table.tsx`, `tasks-columns.tsx`, `tasks-provider.tsx` |
| 테이블 컬럼 정의 | `xxxColumns: ColumnDef<T>[]` | `tasksColumns` |
| 테스트 | 대상 옆에 colocate | `users-action-dialog.test.tsx` |

> ❗ 파일명은 PascalCase가 아니라 **kebab-case**입니다. `default export`가 아닌 **named export**를 기본으로 합니다.

## 폴더 구조

```
src/
├─ routes/        # TanStack Router 파일 기반 라우트 (URL = 폴더 구조)
├─ features/<도메인>/
│  ├─ index.tsx   #  화면(페이지) — named export
│  ├─ components/ #  기능 전용 컴포넌트(도메인 접두사)
│  └─ data/       #  schema.ts(zod) · data.ts(static 옵션) · <도메인>.ts(목 데이터)
├─ components/
│  ├─ ui/         # shadcn/ui — CLI 관리(직접 수정 지양, lint/coverage 제외)
│  ├─ layout/     # 앱 셸(사이드바·헤더)
│  └─ data-table/ # 재사용 테이블
├─ context/       # 전역 Provider (theme/font/direction/...)
├─ stores/        # zustand 스토어
├─ hooks/  lib/  config/  assets/  styles/
```

- **라우트는 얇게**: `createFileRoute(...)` 로 feature 화면을 연결하고, 검색 파라미터는 `validateSearch`에 zod 스키마로 검증. 화면 로직은 `features/`에 둡니다.
- **`routeTree.gen.ts`는 자동 생성** — 절대 손으로 수정하지 않습니다(dev/build가 갱신).

## 컴포넌트

- **함수형 + 훅**만(클래스 금지). 한 파일 한 컴포넌트, 200~400줄 권장.
- props는 명시적 타입. 부수효과는 `useEffect`에 격리하고 의존성 배열 정확히.
- 리스트 `key`는 안정적 식별자(인덱스 금지).
- 클래스 합성은 **`cn()`**(`@/lib/utils`, clsx+tailwind-merge) 사용. 가변 스타일은 **CVA**.
- 방향성 스타일은 **논리 속성**(`ms-`/`me-`/`ps-`/`pe-`/`start`/`end`) — RTL 지원(❌ `ml-`/`mr-` 지양).

## 상태 / 데이터

- **서버 상태 = TanStack Query**, **클라이언트 전역 = zustand**(`useXxxStore = create<State>()(...)`), **기능 내 일시적 UI 상태 = feature Provider + `useXxx` 컨텍스트**(컨텍스트 밖 사용 시 throw).
- 불변 업데이트. 파생 값은 렌더 중 계산 또는 `useMemo`(과용 금지).
- 데이터 호출은 `axios`, 서버 에러는 공통 핸들러로 일원화(`@/lib/handle-server-error`).

## 폼 / 테이블

- 폼: **react-hook-form + `zodResolver`** + shadcn `Form`/`FormField`/`FormItem`/`FormControl`/`FormMessage`. 교차 검증은 zod `.refine()`.
- 테이블: **TanStack Table** `ColumnDef<T>[]` 정의를 `xxx-columns.tsx`로 분리. 필터/페이지네이션 등은 URL 상태와 동기화(`use-table-url-state`).

## 품질 / 도구

- 포맷 **Prettier**: 세미콜론 없음 · 작은따옴표(JSX 포함) · `printWidth 80` · `trailingComma es5` · import 자동 정렬(`@trivago/...sort-imports`).
- 린트 **ESLint**: **`no-console: error`**, 미사용 변수 금지(무시는 `_` 접두), `no-duplicate-imports`, react-hooks 규칙, TanStack Query 플러그인.
- 접근성(a11y): 의미론적 태그·label·키보드 내비게이션·`aria-*`. 로딩/빈/에러 상태 처리.
- 테스트: Vitest(브라우저 모드) + Testing Library, 핵심 플로우 E2E(Playwright).

## 금지

- ❌ `any` 남용 / ❌ 클래스 컴포넌트 / ❌ `routeTree.gen.ts` 수동 편집 / ❌ `components/ui` 임의 개조
- ❌ PascalCase **파일명**(파일은 kebab-case) / ❌ 커밋된 `console.*`(=lint 에러) / ❌ 직접 DOM 조작(ref 외)
- ❌ 서버 상태를 zustand에 중복 보관(서버는 Query) / ❌ 인라인 매직 넘버 / ❌ `ml-`/`mr-` 등 비논리 방향 스타일(RTL 깨짐)
