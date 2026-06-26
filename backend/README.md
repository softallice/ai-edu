# ai-edu 백엔드 — Spring Boot 교육용 템플릿

`spring-projects/spring-boot` 공식 구조를 기준으로 구성한 **모던 Spring Boot REST API** 교육용 템플릿입니다.
두 개의 도메인을 제공합니다.

- **작업(Task)** — 프론트엔드(`../frontend`, shadcn-admin)의 `features/tasks` 와 정렬된 기본 예제.
- **거래처(Customer)** — 사내 레거시 ERP **ndserp(CoreERP_NX17)** 의 `POVM0001(거래처등록)` 화면을
  모던 스택으로 **이관(legacy → modern)** 한 실무형 예제. 자세한 내용은 아래 "레거시 이관" 절 참고.

## 스택

| 분류 | 내용 |
|------|------|
| 런타임 | **Java 25** (Gradle toolchain) |
| 프레임워크 | **Spring Boot 4.0.6** (Spring Framework 7) |
| 빌드 | **Gradle** (Wrapper 포함 — JDK/Gradle 사전 설치 불필요) |
| 웹 | `spring-boot-starter-web` (`@RestController`, REST URL) |
| 영속성 | `spring-boot-starter-data-jpa` + **PostgreSQL**(로컬/운영) |
| 인증 | **JWT(HS256)** 자체 구성 + **BCrypt**(`spring-security-crypto`) |
| 로컬 DB | **PostgreSQL 16** (Docker Compose, `docker-compose.yml`) |
| 테스트 DB | **H2**(인메모리) — Docker 없이도 테스트가 동작하도록 test 스코프로 한정 |
| 검증 | `spring-boot-starter-validation` (Bean Validation) |
| 직렬화 | **Jackson 3** (`tools.jackson`) — Spring Boot 4 기본 |
| 테스트 | JUnit 5 + Spring Test(MockMvc) |

## 실행

로컬 DB는 Docker 의 PostgreSQL 을 사용합니다. **앱을 켜기 전에 DB 컨테이너를 먼저 띄우세요.**

```bash
cd backend

# 1) PostgreSQL 기동 (백그라운드)
docker compose up -d
docker compose ps            # STATUS 가 healthy 인지 확인

# 2) 애플리케이션 실행
./gradlew bootRun            # http://localhost:8080

# 빌드 + 테스트 (테스트는 H2 사용 → Docker 불필요)
./gradlew build
# 테스트만
./gradlew test

# DB 중지 / 데이터까지 삭제
docker compose down          # 중지
docker compose down -v       # 중지 + 데이터 볼륨 삭제
```

DB 접속 정보(기본값): `jdbc:postgresql://localhost:5432/aiedu`, user/pass = `aiedu` / `aiedu`.

> 교육용으로 `ddl-auto=create-drop` 를 사용해 기동 시 스키마를 새로 만들고 종료 시 삭제합니다(재현 가능한 상태 유지).
> 운영에서는 Flyway/Liquibase 로 스키마를 관리하세요(`../docs/3.폐쇄망-GPU서버-아키텍처.md` 참고).
> 최초 실행 시 Gradle Wrapper 가 Gradle 배포본과 의존성을 내려받습니다(네트워크 필요). 폐쇄망에서는 사전 캐싱이 필요합니다.

## REST API

### 작업(Task) — `/api/tasks`

| 메서드 | 경로 | 설명 | 상태 |
|--------|------|------|------|
| `GET` | `/api/tasks` | 작업 목록 | 200 |
| `GET` | `/api/tasks/{id}` | 단건 조회 | 200 / 404 |
| `POST` | `/api/tasks` | 생성 | 201 / 400 |
| `PUT` | `/api/tasks/{id}` | 수정 | 200 / 400 / 404 |
| `DELETE` | `/api/tasks/{id}` | 삭제 | 204 / 404 |

- `status`: `BACKLOG | TODO | IN_PROGRESS | DONE | CANCELED`
- `priority`: `LOW | MEDIUM | HIGH`

### 인증(Auth) — `/api/auth`

레거시 `ComLogin`(세션/메뉴/SSO 기반)의 "자격 증명 검증 → 인증" 핵심을 **무상태 JWT** 로그인으로 모던화했습니다.

| 메서드 | 경로 | 설명 | 레거시 대응 | 상태 |
|--------|------|------|-------------|------|
| `POST` | `/api/auth/login` | 로그인 → `accessToken` + 사용자 정보 | ComLogin_Login | 200 / 400 / 401 |
| `GET` | `/api/auth/me` | `Authorization: Bearer <token>` 로 내 정보 조회 | ComLogin_Mainframe | 200 / 401 |
| `POST` | `/api/auth/logout` | 로그아웃(무상태 — 클라이언트가 토큰 폐기) | ComLogin_Logout | 204 |

응답은 프론트엔드 `auth-store` 의 AuthUser 와 정렬됩니다(`accountNo`, `email`, `role[]`, `exp`(epoch ms)).

데모 계정(시드): `admin@aiedu.local` / `admin1234` (ADMIN·USER), `user@aiedu.local` / `user1234` (USER).

```bash
# 로그인 → 토큰 추출 → 내 정보 조회
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@aiedu.local","password":"admin1234"}' | jq -r .accessToken)
curl http://localhost:8080/api/auth/me -H "Authorization: Bearer $TOKEN"
```

- 비밀번호는 **BCrypt** 해시로 저장(`spring-security-crypto`), 평문 미저장.
- JWT(HS256)는 교육용으로 JDK HMAC 로 직접 구성(`JwtTokenProvider`). 비밀키는 `APP_JWT_SECRET` 로 외부 주입.
- 참고(교육용 한계): 전체 Spring Security 필터 체인은 도입하지 않아 `/api/tasks`·`/api/customers` 등 다른 엔드포인트는 인증 없이 열려 있습니다. 실제 보호가 필요하면 Security 필터로 확장하세요.

### 거래처(Customer) — `/api/customers`

| 메서드 | 경로 | 설명 | 레거시 대응 | 상태 |
|--------|------|------|-------------|------|
| `GET` | `/api/customers` | 목록(요약). `?keyword=&active=&tradeType=` 동적 필터 | SEARCH00 | 200 |
| `GET` | `/api/customers/{id}` | 상세(담당자 포함) | SEARCH01 | 200 / 404 |
| `GET` | `/api/customers/check-business-reg-no?businessRegNo=&excludeId=` | 사업자번호 중복 확인 | SEARCH02/03 | 200 |
| `POST` | `/api/customers` | 생성(거래처 + 담당자) | SAVE00(INSERT) | 201 / 400 / 409 |
| `PUT` | `/api/customers/{id}` | 수정(거래처 + 담당자 동기화) | SAVE00(UPDATE) | 200 / 400 / 404 / 409 |
| `DELETE` | `/api/customers/{id}` | 삭제(담당자 cascade) | DELETE00/01 | 204 / 404 |

- `tradeType`: `BUY(매입) | SALE(매출) | BOTH(매입·매출)`
- 사업자번호 중복 시 `409 Conflict`(전역 예외 처리기에서 변환).

요청 본문 예시:

```json
{
  "businessRegNo": "5551112223",
  "name": "테스트상사",
  "tradeType": "SALE",
  "representativeName": "한지민",
  "active": true,
  "electronicContract": false,
  "contacts": [
    { "department": "총무", "name": "오대리", "telNo": "02-123-4567", "email": "oh@test.co.kr" }
  ]
}
```

빠른 확인:

```bash
curl http://localhost:8080/api/customers
curl http://localhost:8080/api/customers/1
curl "http://localhost:8080/api/customers?tradeType=BUY"
curl -X POST http://localhost:8080/api/customers \
  -H 'Content-Type: application/json' \
  -d '{"businessRegNo":"5551112223","name":"테스트상사","tradeType":"SALE"}'
```

## 레거시 이관 (ndserp → ai-edu/backend)

사내 ERP **ndserp**(Spring 4.3 + 전자정부프레임워크 3.8 + Nexacro 17 + MyBatis + Oracle)의
`POVM0001(거래처등록)` 한 화면을 모던 스택으로 재작성한 사례입니다. 단순 복사가 아니라
**패러다임 이관**임을 보여주는 것이 목적입니다.

| 구분 | 레거시 (ndserp) | 모던 (ai-edu/backend) |
|------|-----------------|------------------------|
| 컨트롤러 | `@Controller extends AbstractController`, `*.do` URL, `ModelAndView` | `@RestController`, 자원 중심 REST URL, DTO 반환 |
| 파라미터 | `Map` (untyped) | `record` + Bean Validation (타입 안전) |
| 서비스 | `Service` 인터페이스 + `ServiceImpl` + 트랜잭션 불명확 | `@Service` + 생성자 주입 + `@Transactional`(조회 `readOnly`) |
| 데이터 접근 | MyBatis 매퍼 XML (`POVM0001_Oracle.xml`) | Spring Data JPA Repository + Specification |
| 동적 SQL | `<where><if>` 조건부 SQL | `JpaSpecificationExecutor` + `CustomerSpecifications` |
| 저장 분기 | SAVE00 안에서 insert/update + 담당자 등록/수정/삭제 수동 분기 | JPA 변경 감지(dirty checking) + `cascade`/`orphanRemoval` |
| 채번 | `selectKey MAX(CUST_CODE)+1` (Oracle) | `findMaxCode()` + 서비스 채번 |
| 컬럼/타입 | `CUST_NM`, `TRAN_EN_YN='Y'`, `FOUND_YMD`(YYYYMMDD 문자열) | `name`, `boolean active`, `LocalDate foundDate` |
| 테이블 | `NDSPMS.BE01C`(거래처) / `NDSPMS.BE10C`(담당자) | `customers` / `customer_contacts` (`@OneToMany` 애그리거트) |
| 인증 | `ComLogin` 세션(USER_IDXX)+메뉴/SSO | `/api/auth` JWT(HS256) 무상태 + BCrypt(`users`) |
| DB | Oracle / MSSQL | PostgreSQL (로컬 Docker) |

> 컬럼은 의미가 드러나는 이름으로 재설계했고, 각 필드의 레거시 컬럼명은 엔티티 주석에 매핑해 두었습니다.
> 부서코드/사원번호 등 다른 테이블 참조(`EHRM.SF_DEPT_NM` 등)는 교육 범위상 제외했습니다.

## 계층 구조

```
src/main/java/com/aiedu/backend/
├─ BackendApplication.java
├─ task/                          # 작업 도메인 (기본 예제)
│  └─ … Task / TaskService / TaskController / dto …
├─ customer/                      # 거래처 도메인 (레거시 이관 예제)
│  ├─ Customer.java               # @Entity 애그리거트 루트 (← BE01C)
│  ├─ CustomerContact.java        # @Entity 담당자 (← BE10C)
│  ├─ TradeType.java              # enum (← BUY_SALE_GB)
│  ├─ CustomerRepository.java     # JpaRepository + JpaSpecificationExecutor
│  ├─ CustomerSpecifications.java # 동적 검색 술어 (← MyBatis <if>)
│  ├─ CustomerService.java        # 비즈니스 로직 + 트랜잭션 경계
│  ├─ CustomerController.java     # @RestController (얇게 유지)
│  ├─ CustomerDataInitializer.java# 교육용 시드(애그리거트 적재)
│  ├─ DuplicateBusinessRegNoException.java  # → 409
│  └─ dto/                        # 요청/응답 record (엔티티 비노출)
└─ common/
   ├─ GlobalExceptionHandler.java # @RestControllerAdvice (404 / 409 / 400)
   ├─ ApiError.java
   └─ ResourceNotFoundException.java
```

설계 원칙(컨벤션 정렬): 컨트롤러는 얇게, 비즈니스 로직·트랜잭션은 서비스, 생성자 주입,
엔티티 비노출(요청/응답 DTO 분리), Bean Validation + 전역 예외 처리.

## 테스트

```bash
./gradlew test     # H2 인메모리 사용 → Docker 불필요
```

- `BackendApplicationTests` — 컨텍스트 로딩 스모크 테스트.
- `TaskControllerTest` — 작업 API 통합 테스트(목록/생성/검증실패/404).
- `CustomerControllerTest` — 거래처 API 통합 테스트(목록/키워드필터/생성+담당자/검증실패/중복409/404).

> 테스트는 `src/test/resources/application.yml` 의 H2 설정으로 동작하며, 운영/로컬 실행은
> `src/main/resources/application.yml` 의 PostgreSQL 설정을 사용합니다(프로파일/리소스 분리).

## 하네스 연동

```bash
# spring-boot 컨벤션 overlay 생성 (common 자동 포함)
node ../harness/scripts/apply-convention.cjs ./ spring-boot
# 또는 풀스택 프로파일
node ../harness/scripts/apply-convention.cjs ./ --profile react-spring
```

자세한 내용은 `../docs/6.프론트엔드-템플릿-구조.md` 5장(백엔드)과 `../docs/2.PDCA-방법론.md`를 참고하세요.
