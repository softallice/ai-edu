---
name: frontend-patterns
description: Frontend patterns for the ai-edu React stack — Vite, TanStack Router/Query/Table, shadcn/ui, zustand, react-hook-form + zod.
origin: ECC (adapted for ai-edu/frontend)
---

# Frontend Development Patterns

`ai-edu/frontend`(shadcn-admin 기반)의 실제 스택에 맞춘 React 패턴입니다.
모든 예제는 이 코드베이스의 코드 스타일(세미콜론 없음, 작은따옴표, `@/` 별칭, inline type-import, kebab-case 파일)을 따릅니다.

## 스택 / 활성화 시점

Vite · TypeScript(strict) · **TanStack Router**(파일 기반) · **TanStack Query** · **TanStack Table** · **shadcn/ui**(Radix + Tailwind v4) · **zustand** · **react-hook-form + zod**.

- 새 화면(feature)·라우트 추가, 컴포넌트 합성
- 상태 관리(서버=Query / 전역=zustand / 일시적 UI=feature Context)
- 폼(react-hook-form + zod)·테이블(TanStack Table)·URL 상태
- 접근성·RTL·성능

## 기능(feature) 모듈 구조

화면은 `features/<도메인>/`에 자기완결로 둡니다. 라우트는 이를 연결만 합니다.

```
features/tasks/
├─ index.tsx                 # 페이지 (named export: export function Tasks())
├─ components/               # 도메인 접두사: tasks-table.tsx, tasks-columns.tsx ...
└─ data/                     # schema.ts(zod) · data.ts(옵션) · tasks.ts(목 데이터)
```

```tsx
// features/tasks/index.tsx — Provider로 감싸고 화면 조립
export function Tasks() {
  return (
    <TasksProvider>
      <Header fixed>{/* ... */}</Header>
      <Main>
        <TasksTable data={tasks} />
      </Main>
      <TasksDialogs />
    </TasksProvider>
  )
}
```

## 파일 기반 라우팅 (TanStack Router)

라우트 파일은 **얇게** — 검색 파라미터를 zod로 검증하고 feature 컴포넌트를 연결합니다.
`routeTree.gen.ts`는 자동 생성되므로 **직접 수정하지 않습니다**.

```tsx
// routes/_authenticated/tasks/index.tsx
import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Tasks } from '@/features/tasks'

const taskSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/tasks/')({
  validateSearch: taskSearchSchema, // URL = 타입 안전한 상태 소스
  component: Tasks,
})
```

## 컴포넌트 + 클래스 합성

함수형 컴포넌트 + **named export**, 파일은 kebab-case. 클래스 합성은 `cn()`.

```tsx
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 사용: 조건부/병합 클래스
<div className={cn('flex items-center', isActive && 'bg-accent', className)} />
```

- shadcn/ui 컴포넌트는 `@/components/ui`에서 가져다 씁니다(직접 개조 지양 — CLI 관리).
- 방향성 스타일은 **논리 속성**(`ms-`/`me-`/`ps-`/`pe-`/`start`/`end`)으로 RTL 지원.
- 가변(variant) 스타일은 **CVA**(`class-variance-authority`).

## 상태 관리

### 서버 상태 = TanStack Query

`QueryClient`를 한 곳(`main.tsx`)에서 구성하고, 에러를 일원화합니다.

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 10 * 1000 },
    mutations: { onError: (e) => handleServerError(e) },
  },
})
// 401 → 인증 리셋 후 /sign-in, 500 → 에러 페이지 (queryCache.onError)
```

### 전역 클라이언트 상태 = zustand

```tsx
// stores/auth-store.ts
import { create } from 'zustand'

interface AuthState {
  auth: { user: User | null; setUser: (u: User | null) => void; reset: () => void }
}

export const useAuthStore = create<AuthState>()((set) => ({
  auth: {
    user: null,
    setUser: (user) => set((s) => ({ auth: { ...s.auth, user } })),
    reset: () => set((s) => ({ auth: { ...s.auth, user: null } })),
  },
}))
```

> 서버에서 온 데이터는 zustand에 **중복 저장하지 않습니다**(Query 캐시가 출처).

### 기능 내 일시적 UI 상태 = feature Context + `useXxx`

다이얼로그 열림/선택 행처럼 화면 한정 상태는 feature Provider로 묶고, 컨텍스트 밖 사용 시 throw하는 훅을 둡니다.

```tsx
// features/tasks/components/tasks-provider.tsx
const TasksContext = React.createContext<TasksContextType | null>(null)

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<TasksDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Task | null>(null)
  return (
    <TasksContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </TasksContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTasks = () => {
  const ctx = React.useContext(TasksContext)
  if (!ctx) throw new Error('useTasks has to be used within <TasksProvider>')
  return ctx
}
```

## 폼 — react-hook-form + zod

zod 스키마를 SSOT로, `zodResolver`로 연결하고 shadcn `Form` 프리미티브로 렌더링합니다.

```tsx
const formSchema = z
  .object({
    username: z.string().min(1, 'Username is required.'),
    email: z.email(),
    password: z.string().min(8, 'At least 8 characters.'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
})
// <Form {...form}><FormField .../><FormMessage /></Form>
```

## 테이블 — TanStack Table

컬럼 정의는 `xxx-columns.tsx`에 `ColumnDef<T>[]`로 분리하고, 필터/페이지네이션은 URL 상태와 동기화합니다.

```tsx
// features/tasks/components/tasks-columns.tsx
import { type ColumnDef } from '@tanstack/react-table'
import { type Task } from '../data/schema'

export const tasksColumns: ColumnDef<Task>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Task' />,
    cell: ({ row }) => <span>{row.getValue('title')}</span>,
  },
  // ...
]
// 필터/페이지 상태는 useTableUrlState 로 ?page=&filter= 와 동기화
```

## 커스텀 훅

순수 로직은 `hooks/use-xxx.ts`로 추출. 콜백/옵션은 ref로 안정화해 effect 무한루프를 피합니다.

```tsx
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}
```

## 성능

- `useMemo`는 **비싼 계산**에만(정렬 전 `[...arr]` 복사 — `sort`는 제자리 변경).
- 자식에 넘기는 함수는 `useCallback`, 순수 컴포넌트는 `React.memo`.
- 코드 스플리팅은 라우터의 `autoCodeSplitting`이 라우트 단위로 처리(별도 `lazy` 최소화).

## 접근성 / 품질

- 의미론적 태그·`label`·키보드 내비게이션·`aria-*`. 로딩/빈/에러 상태를 항상 처리.
- `no-console: error` — 디버그 로그 커밋 금지. 미사용 변수는 `_` 접두로만 허용.

**핵심**: 화면은 feature에, 라우트는 얇게, 서버 상태는 Query·전역은 zustand·일시적 UI는 feature Context. 스타일은 `cn()`+Tailwind 논리 속성, 폼/모델은 zod를 단일 출처로.
