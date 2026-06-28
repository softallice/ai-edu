# ai-edu Nexacro 프론트 (연동 스캐폴드)

레거시 ERP(ndserp)의 Nexacro 화면을 모던 백엔드(`../backend`)에 **연동**하기 위한 Nexacro N(17+)
프로젝트 스캐폴드입니다. 거래처등록(`POVM0001`) 한 화면을 샘플로 제공하며, 백엔드의 Nexacro
연동 어댑터(`/nexacro/erp/po/POVM0001_*.do`, JSON)와 트랜잭션 통신합니다.

> 하네스 컨벤션 준수: `../harness/conventions/nexacro/CONVENTION.md`
> (sPACKAGENAME / on_initEvent / lib_script_common include / fnc_TransactionCall / ds 네이밍 / .xfdl + .xfdl.js 쌍)

## ⚠️ 선행 조건 — Nexacro 런타임 라이브러리

Nexacro N 런타임은 **상용 라이선스**라 이 저장소에 포함되지 않습니다. 브라우저에서 실제로 구동하려면
라이선스 보유 후 런타임을 아래 경로에 배치해야 합니다(레거시 `ndserp` 의 `nexacro17lib` 참고).

```
nexacro/
└─ core_erpn/
   ├─ nexacro17lib/        # ← 상용 런타임(별도 배치 필요): component/framework/resources ...
   ├─ bootstrap.xml
   ├─ environment.xml      # 서비스 svc_erp → 백엔드 URL
   ├─ typedefinition.xml
   ├─ appvariables.xml
   ├─ core_erpn.xadl       # Nexacro Studio 프로젝트 기술서
   ├─ lib/
   │  └─ lib_script_common.xjs   # fnc_TransactionCall 공통 스크립트
   └─ u/po/
      ├─ POVM0001.xfdl     # 설계 소스(XFDL)
      └─ POVM0001.xfdl.js  # 브라우저 런타임(필수)
```

라이브러리가 없으면 화면은 뜨지 않지만, **연동 경로(서비스 URL·트랜잭션·데이터셋·콜백)는 모두 구성**되어 있습니다.

## 실행

```bash
# 1) 백엔드 기동 (거래처 API + Nexacro 어댑터)
cd ../backend && docker compose up -d && ./gradlew bootRun   # http://localhost:8080

# 2) 정적 서버로 nexacro/core_erpn 서빙 (예: 3000 포트 — 백엔드 CORS 허용 목록에 포함됨)
cd ../nexacro/core_erpn && npx --yes serve -l 3000
#   → 브라우저에서 start.html 또는 Nexacro Studio 로 POVM0001 실행
```

서비스 URL은 `appvariables.xml` 의 `gv_svcUrl`(기본 `http://localhost:8080/nexacro`)에서 변경합니다.

## 백엔드 연동 프로토콜 (JSON)

백엔드 어댑터: `com.aiedu.backend.nexacro.NexacroCustomerController`

| 트랜잭션 | URL | In 데이터셋 | Out 데이터셋 |
|----------|-----|-------------|--------------|
| 목록 | `POVM0001_SEARCH00.do` | `ds_Search`(CUST_CD_AND_NM, BUY_SALE_GB, TRAN_EN_YN) | `ds_List` |
| 상세 | `POVM0001_SEARCH01.do` | `ds_Search`(ID) | `ds_CustInfo`, `ds_CustMngr` |
| 저장 | `POVM0001_SAVE00.do` | `ds_CustInfo`(+ID 없으면 신규), `ds_CustMngr` | `ds_CustInfo` |
| 삭제 | `POVM0001_DELETE00.do` | `ds_Search`(ID) | - |

응답 봉투: `{ "ErrorCode": 0, "ErrorMsg": "SUCC", "ds_Xxx": [ ... ] }` (ErrorCode<0 = 실패).

- 데이터셋 컬럼은 **레거시 컬럼명**(CUST_CODE, CUST_NM, SAUP_NO, BUY_SALE_GB, TRAN_EN_YN …)을 유지.
- 행 식별 키는 surrogate `ID`(Long). 레거시 CUST_CODE 는 표시·채번용.
- `BUY_SALE_GB` 값: `BUY|SALE|BOTH`. `TRAN_EN_YN`/`ECONT_YN`: `Y|N`.

## 한계 / 후속

- 상용 런타임 미포함 → 실제 브라우저 구동은 라이브러리 배치 후 가능.
- 샘플은 거래처(POVM0001) 1화면. 다른 화면도 동일 패턴(.xfdl + .xfdl.js + fnc_TransactionCall)으로 확장.
- 정통 Nexacro 통신(SSV/바이너리)은 상용 platform 서버 라이브러리가 필요하므로, 여기서는 JSON
  데이터포맷으로 연동합니다(`environment.xml` 서비스 설정 참고).

## 검증 상태 (headless Chromium 실측)

런타임 배치 후 `index.html`을 헤드리스 크로미움으로 로드해 확인한 결과:

| 항목 | 상태 |
|------|------|
| Nexacro 엔진 로드(`nexacro17lib`) | ✅ |
| 테마(`theme::inbus`)·리소스 로드 | ✅ (asset 404 없음) |
| 앱 부팅(`environment.xml.js` + `core_erpn.xadl.js`) | ✅ (gv_svcUrl 등 app 변수 로드) |
| **POVM0001 폼 렌더** | ✅ (조회/신규/저장/삭제 버튼·거래처등록 타이틀·74개 컴포넌트) |
| 백엔드 어댑터 라운드트립(`*.do`, JSON) | ✅ (curl 실측: 목록/상세/저장) |
| 폼 init 자동 트랜잭션(onload→조회) | ⚠️ **미발화** |

⚠️ **마지막 단계(폼 이벤트/트랜잭션 배선)**: `POVM0001.xfdl.js`는 손수 작성한 부트 스텁이라
Nexacro 컴파일러가 생성하는 **onload 이벤트 바인딩 / `include "script::..."` 로딩** 배선을 완전히
재현하지 못합니다. 그래서 엔진·폼은 뜨지만 `fnc_TransactionCall`로 이어지는 자동 조회가 발화하지
않습니다. **해결: Nexacro Studio 에서 이 프로젝트를 열고 `Generate`(컴파일)** 하면 `.xfdl`/`.xadl`
원본으로부터 정식 `.js`가 생성되어 onload·트랜잭션까지 동작합니다. 백엔드 연동(URL·프로토콜·어댑터)은
이미 완비되어 있으므로, Studio Generate 후 즉시 통신됩니다.

## 화면 구성 (로그인 + 메인 셸)

부팅 흐름: **로그인(comLogin) → 메인 프레임셋[상단 topFrame + 메뉴 menuFrame + 작업영역 WORKFRAME]**.

| 화면 | 파일 | 백엔드 연동 |
|------|------|-------------|
| 로그인 | `c/common/comLogin.xfdl(.js)` | `POST /nexacro/com/ComLogin_Login.do` → JWT 토큰/사용자 |
| 상단바 | `c/frame/topFrame.xfdl(.js)` | (로그아웃 → `gfn_logout`) |
| 메뉴 | `c/frame/menuFrame.xfdl(.js)` | `POST /nexacro/com/ComLogin_Menu.do` → 메뉴 목록 |
| 작업영역(거래처) | `u/po/POVM0001.xfdl(.js)` | `/nexacro/erp/po/POVM0001_*.do` |

전역 함수(`core_erpn.xadl.js`): `gfn_openMainFrame`(로그인→메인 전환), `gfn_openWork(formurl)`(메뉴 클릭→작업영역 폼 로드), `gfn_logout`.

백엔드 어댑터: `NexacroCommonController`(로그인/메뉴), `NexacroCustomerController`(거래처).

데모 로그인: `admin@aiedu.local` / `admin1234` (또는 `user@aiedu.local` / `user1234`).

### 검증(headless) — 로그인 화면
- 로그인 화면 렌더 ✅ ("ai-edu ERP 로그인" + 로그인 버튼, asset 404·에러 없음)
- 백엔드 로그인/메뉴 어댑터 ✅ (curl 실측: 성공 시 토큰+사용자, 실패 시 ErrorCode -1, 메뉴 목록)
- ⚠️ 로그인 클릭→메인 전환, 메뉴→화면 이동 등 **이벤트/트랜잭션/프레임 전환의 완전한 동작은 Nexacro Studio `Generate` 필요**(손수 작성 `.xfdl.js`의 컴파일 배선 한계 — 위 "검증 상태" 참고).
