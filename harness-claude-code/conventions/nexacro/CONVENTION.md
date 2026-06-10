# 컨벤션 팩: nexacro

> Nexacro N(17+) 프론트엔드 사이트용 컨벤션.
> 출처: nkit `rules/nexacro/*`. 상세 패턴: `@skills/nexacro-components-guide`, `@skills/nexacro-grid-design`, `@skills/nexacro-transaction-guide`, `@skills/nexacro-design-guide`.

## 필수 원칙

- 폼 최상단에 `this.sPACKAGENAME = "{ID}"` 선언 필수.
- `on_initEvent` 핸들러 필수.
- 공통 스크립트 include 필수: `include "script::lib_script_common.xjs"`.
- 트랜잭션은 **`fnc_TransactionCall()`** 사용 (❌ `nexacro.createObject("Transaction")` 금지).
- Grid 포맷은 `set_format()` 사용.
- Div 내부 컴포넌트는 `this.divId.form.compId`로 접근 (❌ `this.compId` 직접 접근 금지).

## 필수 출력 파일 (둘 다 생성)

| 파일 | 경로 예 | 역할 |
|------|--------|------|
| `.xfdl` | `nx17/.../{ID}.xfdl` | XFDL IDE 소스(설계 기준) |
| `.xfdl.js` | `.../{ID}.xfdl.js` | 브라우저 런타임(실제 동작) |

- `.xfdl`의 `<Script>`와 `.xfdl.js`의 `registerScript` 내 코드는 **동일 패턴** 유지.
- ⚠️ `.xfdl.js` 누락 시 브라우저에서 화면이 동작하지 않음.

## 네이밍

| 항목 | 패턴 |
|------|------|
| 검색 Dataset | `ds_Search`, `ds_{ID}_Search` |
| 목록 Dataset | `ds_List`, `ds_{ID}_List` |
| 초기화 | `fn_Init` |
| 검색/저장 | `fn_Search`, `fn_Save` |
| 콜백 | `fn_PostProcess` |

## 품질 / 금지

- 컴포넌트 접근·트랜잭션·Dataset 네이밍 규칙 준수.
- ❌ Transaction 직접 생성 / ❌ Div 컴포넌트 직접 접근 / ❌ `.xfdl.js` 누락 / ❌ `on_initEvent` 누락 / ❌ `sPACKAGENAME` 누락.
