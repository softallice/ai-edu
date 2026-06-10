# 컨벤션 팩: egov-backend (전자정부 프레임워크)

> 전자정부 표준프레임워크(EgovFramework, Spring MVC 기반) 백엔드 + MyBatis 사이트용 컨벤션.
> 상세 패턴: `@skills/spring-mvc-patterns`, `@skills/mybatis-guide`, `@skills/backend-patterns`.
> NDSERP 등 특정 사이트의 구체 규칙은 하단 "사이트 오버라이드 예시" 또는 사이트 전용 팩으로 분리하세요.

## 계층 구조 (일반 표준)

- **Controller**: 얇게. 요청 수신·검증·서비스 위임·응답. 비즈니스 로직 금지.
- **Service / ServiceImpl**: 비즈니스 로직. 인터페이스 + 구현 분리.
- **Mapper(DAO) + MyBatis XML**: 데이터 접근.
- **생성자 주입** 사용(필드 주입 금지). 트랜잭션 경계는 Service에.

## 예외 / 응답

- 업무 예외는 `EgovBizException`(또는 사이트 표준 예외)로 던지고 명확한 메시지.
- 응답은 사이트 표준 래퍼로 통일. 에러를 조용히 삼키지 않기.

## MyBatis / SQL (필수)

- 파라미터 바인딩 **`#{PARAM}`** 필수 — ❌ `${PARAM}` 금지(SQL Injection).
- LIKE는 `'%' || #{PARAM} || '%'` (❌ `'%${PARAM}%'` 금지).
- ORDER BY 동적 처리는 `<choose>` **화이트리스트**만 (❌ `${SORT_COL}` 금지).
- 동적 SQL은 `<if>/<choose>/<where>/<foreach>`. SQL은 `<![CDATA[...]]>`.
- mapper `namespace`는 Mapper 클래스명과 정확히 일치.
- (Oracle) 페이징은 DBMS 방언에 맞게(예: 11g는 `ROWNUM`).

## 네이밍 (일반)

| 항목 | 패턴 |
|------|------|
| Controller | `{Domain}Controller` |
| Service | `{Domain}Service` / `{Domain}ServiceImpl` |
| Mapper | `{Domain}Mapper` |
| URL | `/{module}/{action}.do` |

## 금지

- ❌ `${}` SQL 바인딩 / ❌ 필드 주입 / ❌ Controller 비즈니스 로직 / ❌ 하드코딩 시크릿·접속정보 / ❌ 스키마 접두사 누락(필요 사이트)

---

## 사이트 오버라이드 예시: NDSERP (참고용)

> 아래는 특정 사이트(NDSERP)의 더 엄격한 구체 규칙 예시입니다. 해당 사이트에서만 활성화하세요.

- Controller: `@Controller extends AbstractController` (❌ `@RestController` 금지)
- 파라미터: `CoreRequest coreRequest` → `Map param` (❌ `@RequestBody`/DTO 금지)
- 반환: `ResponseData` (`makeResponseData(...)`) (❌ `ResponseEntity` 금지)
- ServiceImpl: `AbstractServiceImpl implements {ID}Service`, Mapper: `InbusAbstractMapper` 확장
- Null 처리: `Objects.toString(param.get("KEY"), "")` (❌ 존재하지 않는 `StringUtil.nvl()` 금지)
- 금액/수량: `BigDecimal` (❌ double/float), 조회는 `selectList()` (❌ `selectData()` → `List` 캐스팅 금지)
- 스키마 접두사 필수: `NDSERP.TB_*`
- URL: `/core/erp/{module}/{ID}_{Method}{NN}.do`, 메서드: `process{Method}{NN}`
