# ai-edu 프론트엔드 — React-TS 교육용 템플릿

[satnaing/shadcn-admin](https://github.com/satnaing/shadcn-admin) 을 기반으로 **교육용으로 정리한** 관리자 대시보드 템플릿입니다.
수강생이 PDCA·컨벤션을 적용하며 기능을 추가/수정할 때의 **기준 코드베이스**로 사용합니다.

> 원저작물의 라이선스는 `LICENSE`(MIT)에 보존되어 있습니다.
> 교육 흐름과 무관한 요소(외부 인증 SDK·CI/배포 설정 등)는 제거했습니다. 아래 "원본 대비 변경점" 참고.

## 스택

| 분류 | 라이브러리 |
|------|-----------|
| 빌드 | **Vite** + `@vitejs/plugin-react` |
| 언어 | **TypeScript** (strict, `noUnusedLocals`/`noUnusedParameters`) |
| UI | **shadcn/ui** (Radix UI + `class-variance-authority`) |
| 스타일 | **Tailwind CSS v4** |
| 라우팅 | **TanStack Router** (파일 기반, `routeTree.gen.ts` 자동 생성) |
| 서버 상태 | **TanStack Query** |
| 테이블 | **TanStack Table** |
| 폼/검증 | **react-hook-form** + **zod** |
| 클라이언트 상태 | **zustand** |
| HTTP | **axios** |
| 테스트 | **Vitest**(브라우저 모드, Playwright) |
| 품질 | ESLint + Prettier |

## 실행

```bash
cd frontend
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # tsc -b && vite build (타입체크 후 번들)
pnpm lint
pnpm test         # 최초 1회: pnpm test:browser:install
```

> 패키지 매니저는 **pnpm** 입니다(`pnpm-lock.yaml`). npm으로 재설치하지 마세요.

## 구조 (요약)

```
src/
├─ main.tsx             # 앱 부트스트랩 (Router + QueryClient + Provider 트리)
├─ routeTree.gen.ts     # TanStack Router 자동 생성 (수정 금지)
├─ routes/              # 파일 기반 라우트 (URL 구조 = 폴더 구조)
├─ features/            # 도메인별 화면·로직 (실습 진입점)
├─ components/          # ui / layout / data-table 공용 컴포넌트
├─ context/             # theme/font/direction/layout/search Provider
├─ stores/              # zustand (auth 등)
├─ hooks/  lib/  config/  assets/  styles/
```

실습 권장 진입점:

- `features/tasks` — TanStack Table + URL 상태(필터/페이지네이션)
- `features/users` — 폼 + 다이얼로그(CRUD UI)
- `features/settings` — react-hook-form + zod 검증 폼

화면 구현은 `features/`에 있고, `routes/`는 이를 연결만 합니다. 라우트를 추가/삭제하면 `routeTree.gen.ts`는 dev 서버(또는 빌드)가 자동 갱신합니다 — **직접 수정하지 않습니다.**

전체 구조·하네스 연동·PDCA 적용은 [`../docs/6.프론트엔드-템플릿-구조.md`](../docs/6.프론트엔드-템플릿-구조.md) 를 참고하세요.

## 원본 대비 변경점 (교육용 정리)

제거한 항목:

- **Clerk 인증 통합** — 외부 SDK·발급키(`VITE_CLERK_PUBLISHABLE_KEY`)가 필요해 교육 흐름에 부담. `src/routes/clerk/`, `src/assets/clerk-*`, `@clerk/react` 의존성, 사이드바 "Secured by Clerk" 메뉴, `.env(.example)` 제거. 기본 인증은 `stores/auth-store` 로 동작합니다.
- **레포 운영 파일** — `CHANGELOG.md`, `cz.yaml`(commitizen), `netlify.toml`(배포), `.github/`(CI·이슈 템플릿), `knip`(미사용 코드 검출 도구).

앱 기능(dashboard / tasks / users / apps / chats / settings / auth / errors)은 모두 유지했습니다.
