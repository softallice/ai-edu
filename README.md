# ai-edu — AI 코딩 교육 (OpenCode + Ollama 하네스)

로컬 PC에서 **인터넷 없이 동작하는 AI 코딩 에이전트 실습 환경**입니다.
WSL + **Ollama**(로컬 LLM) + **OpenCode**(에이전트 CLI) + **하네스**(에이전트·커맨드·PDCA·컨벤션 설정)로 구성됩니다.

- 교육 저장소: <https://github.com/softallice/ai-edu.git>
- 대상: AI 보조 개발(에이전트 코딩)을 처음 배우는 수강생
- 스택 예시: TypeScript/React, Nexacro, 전자정부(EgovFramework) 백엔드

---

## 무엇을 배우나요?

- OpenCode 에이전트로 코드를 **계획→구현→검증**하는 흐름
- **PDCA 방법론**으로 품질 게이트를 통과시키며 기능 개발
- 사이트마다 다른 **코딩 컨벤션**을 손쉽게 적용
- (심화) GPU 서버·폐쇄망 환경으로 확장

---

## 1. 사전 준비

| 도구 | 확인 | 없으면 |
|------|------|--------|
| WSL(Ubuntu) | `uname -a` | Windows 기능에서 WSL 설치 |
| Node.js ≥18 | `node -v` | `docs/1.환경설정.md` 2단계 |
| Ollama | `ollama --version` | `docs/1.환경설정.md` 3단계 |
| OpenCode | `opencode --version` | 아래 4번에서 설치 |

> 처음이라면 **먼저 [`docs/1.환경설정.md`](docs/1.환경설정.md)** 로 WSL·Java·Node·Ollama·OpenCode 런타임을 설치하세요.

---

## 2. 프로젝트 폴더 생성

작업용 상위 폴더를 만듭니다.
```bash
# 홈 아래에 작업 폴더 생성
mkdir -p ~/work
cd ~/work
```

---

## 3. 교육 소스 다운로드 (clone)

```bash
# 교육 저장소 내려받기
git clone https://github.com/softallice/ai-edu.git
cd ai-edu

# 폴더 구조 확인
ls
# docs/  harness/  README.md
```

> 이미 받아둔 경우 최신화: `cd ~/work/ai-edu && git pull`

---

## 4. 설치

```bash
# 4-1. 로컬 코딩 모델 다운로드 (최초 1회)
ollama pull qwen2.5-coder:7b

# 4-2. OpenCode CLI 전역 설치
npm install -g opencode-ai

# 4-3. 하네스 의존성 설치 (플러그인/도구용)
cd ~/work/ai-edu/harness
npm install

# 4-4. 설치 확인
ollama list                 # qwen2.5-coder:7b 보이면 OK
opencode --version          # 버전 출력
npx tsc --noEmit && echo OK # 하네스 타입 점검(선택)
```

---

## 5. 실행 및 사용 방법

### 5-1. 실행
하네스 폴더에서 OpenCode를 실행합니다(설정이 자동 로드됩니다).
```bash
cd ~/work/ai-edu/harness
opencode
```
- 기본 모델: `ollama/qwen2.5-coder:7b` · 기본 에이전트: `build`
- 도움말: `/help` · 종료: `/exit` (또는 `Ctrl+C`)
- 에이전트 전환: `Tab` (`build` ↔ `pdca-orchestrator`)

### 5-2. 기본 사용 (자연어)
```
"간단한 할 일(todo) REST API를 만들어줘"
"이 함수의 버그를 찾아서 고쳐줘"
```

### 5-3. 주요 명령어
| 명령 | 설명 |
|------|------|
| `/plan <설명>` | 구현 계획 수립(작성 전 확인) |
| `/tdd <대상>` | 테스트 우선 개발 |
| `/code-review` | 코드 품질·보안 리뷰 |
| `/build-fix` | 빌드/타입 오류 수정 |
| `/verify` | 빌드·린트·테스트·보안 일괄 검증 |
| `/pdca-full <기능>` | PDCA 전체 루프 자동 실행 |
| `/pdca-status` · `/pdca-next` | 진행 상태 / 다음 단계 |
| `/apply-convention <폴더> <팩>` | 실습 폴더에 컨벤션 적용 |

전체 40종은 실행 후 `/help` 또는 [`harness/README.md`](harness/README.md) 참고.

### 5-4. PDCA로 기능 개발 (예시)
```
/pdca-full todo-api
# 계획 → 설계 → 구현 → 검증(품질 게이트) → 개선 → 보고 순으로 진행
```
자세한 내용: [`docs/2.PDCA-방법론.md`](docs/2.PDCA-방법론.md)

### 5-5. 사이트별 컨벤션 적용
```bash
# 실습 폴더에 컨벤션 overlay 생성 (common 자동 포함)
node ~/work/ai-edu/harness/scripts/apply-convention.cjs <실습폴더> react-typescript
node ~/work/ai-edu/harness/scripts/apply-convention.cjs <실습폴더> nexacro egov-backend
# 프로파일 사용
node ~/work/ai-edu/harness/scripts/apply-convention.cjs <실습폴더> --profile nexacro-egov
```
자세한 내용: [`docs/4.사이트별-컨벤션.md`](docs/4.사이트별-컨벤션.md)

---

## 6. 폴더 구조

```
ai-edu/
├─ README.md                  # (이 문서)
├─ docs/                      # 교육 문서
│  ├─ 1.환경설정.md
│  ├─ 2.PDCA-방법론.md
│  ├─ 3.폐쇄망-GPU서버-아키텍처.md
│  ├─ 4.사이트별-컨벤션.md
│  ├─ 5.로컬교육-설치-활용.md
│  └─ 6.프론트엔드-템플릿-구조.md
├─ harness/                   # OpenCode 하네스 (설정 본체)
│  ├─ opencode.json           # 모델/에이전트/커맨드/MCP/스킬 설정
│  ├─ commands/  prompts/  skills/  tools/  plugins/
│  ├─ conventions/            # 사이트별 컨벤션 팩 + 생성기
│  ├─ config/                 # PDCA·서버 모드 설정 예시
│  └─ examples/               # 컨벤션 overlay 예시
├─ frontend/                  # React-TS 실습 템플릿 (shadcn-admin 기반)
└─ backend/                   # Spring Boot REST 실습 템플릿 (Boot 4 + Gradle)
```

---

## 7. 학습 순서 (문서 가이드)

1. [`docs/1.환경설정.md`](docs/1.환경설정.md) — 런타임 설치
2. [`docs/5.로컬교육-설치-활용.md`](docs/5.로컬교육-설치-활용.md) — **설치·실행·활용 핵심 가이드**
3. [`docs/2.PDCA-방법론.md`](docs/2.PDCA-방법론.md) — 개발 방법론
4. [`docs/4.사이트별-컨벤션.md`](docs/4.사이트별-컨벤션.md) — 컨벤션 적용
5. [`docs/6.프론트엔드-템플릿-구조.md`](docs/6.프론트엔드-템플릿-구조.md) — 프론트엔드 실습 템플릿 구조
6. [`docs/3.폐쇄망-GPU서버-아키텍처.md`](docs/3.폐쇄망-GPU서버-아키텍처.md) — (심화) 서버·폐쇄망 확장

---

## 8. 자주 묻는 문제

| 증상 | 해결 |
|------|------|
| 모델 응답 없음 / `connection refused` | Ollama 실행 확인: `curl http://localhost:11434/api/tags` |
| `model not found` | `ollama pull qwen2.5-coder:7b` 재실행 |
| 커맨드가 안 보임 | `harness/` 폴더에서 `opencode` 실행했는지 확인 |
| 플러그인/도구 오류 | `cd harness && npm install` |
| 응답이 장황/부정확 | 7B 모델 한계 — 작업을 작게 쪼개고 PDCA 단계별 진행 |

자세한 트러블슈팅: [`docs/5.로컬교육-설치-활용.md`](docs/5.로컬교육-설치-활용.md) 8장

---

## 빠른 시작 (한 장 요약)

```bash
mkdir -p ~/work && cd ~/work
git clone https://github.com/softallice/ai-edu.git
cd ai-edu/harness
ollama pull qwen2.5-coder:7b
npm install -g opencode-ai
npm install
opencode
# 실행 후:  /pdca-full my-first-feature
```
