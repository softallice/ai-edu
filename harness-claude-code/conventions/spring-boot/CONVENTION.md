# 컨벤션 팩: spring-boot

> 모던 Spring Boot REST 백엔드 사이트용 컨벤션.
> **기준 템플릿**: `ai-edu/backend` (Spring Boot 4 + Java + Gradle + Spring Data JPA).
> 상세 패턴: `@.claude/skills/backend-patterns`, `@.claude/skills/api-design`, `@.claude/skills/coding-standards` 참조.
> (전자정부 표준프레임워크 + MyBatis 사이트는 별도 팩 `egov-backend`를 사용하세요.)

## 기준 스택

Spring Boot 4.x · Java(Gradle toolchain) · **Gradle**(Wrapper 포함) · `spring-boot-starter-web`(`@RestController`) · **Spring Data JPA** + H2/PostgreSQL · `spring-boot-starter-validation`(Bean Validation) · **Jackson 3**(`tools.jackson`). 새 코드는 이 스택을 따릅니다.

## 계층 구조

```
com.aiedu.backend/
├─ <도메인>/                  # 도메인별 패키지 (예: task/)
│  ├─ <Domain>Controller     # @RestController — 얇게
│  ├─ <Domain>Service        # @Service — 비즈니스 + 트랜잭션 경계
│  ├─ <Domain>Repository     # JpaRepository
│  ├─ <Domain>(Entity)       # @Entity — 도메인 메서드 캡슐화
│  └─ dto/ <Domain>Request, <Domain>Response   # record + Bean Validation
└─ common/                   # 전역 예외 처리·공통 응답 등
```

- **도메인별 패키지**(`task/`, `order/` …)로 묶고, 전역 횡단 관심사는 `common/`.
- **Controller**: 요청 수신·검증 위임·서비스 호출·응답 매핑만. 비즈니스 로직 금지.
- **Service**: 비즈니스 로직과 **트랜잭션 경계**(클래스 `@Transactional(readOnly = true)` + 쓰기 메서드에 `@Transactional`).
- **Repository**: `JpaRepository<T, ID>` 인터페이스. 데이터 접근만.
- **Entity**: 영속 상태 + 도메인 행위. 표현/요청과 분리.

## 의존성 주입 / 트랜잭션

- **생성자 주입**만 사용(❌ 필드 주입 `@Autowired` 필드). 의존성은 `private final`.
- 트랜잭션은 **Service 계층**에. 조회는 `readOnly = true`, 변경 메서드에만 쓰기 트랜잭션.

```java
@Service
@Transactional(readOnly = true)
public class TaskService {
    private final TaskRepository taskRepository;
    public TaskService(TaskRepository taskRepository) { this.taskRepository = taskRepository; }

    @Transactional
    public TaskResponse create(TaskRequest req) { ... }
}
```

## 엔티티

- `@Entity` + `@Table`. **protected 기본 생성자**(JPA 전용) + **정적 팩터리**(`create(...)`)로 생성.
- 상태 변경은 **도메인 메서드**(`update(...)`)로 캡슐화(무분별한 setter 금지).
- enum 매핑은 **`@Enumerated(EnumType.STRING)`**(❌ ORDINAL). 식별자는 `@GeneratedValue`.

## DTO / 표현 계층

- 요청/응답은 **`record`**. **엔티티를 직접 노출/반환하지 않습니다**(`Response.from(entity)`로 변환).
- 입력 검증은 **Bean Validation**(`@NotBlank`/`@NotNull`/`@Size`/`@Email` …) + 컨트롤러에서 `@Valid`.

```java
public record TaskRequest(@NotBlank @Size(max = 200) String title,
                          @NotNull TaskStatus status) {}
```

## REST API

- 리소스 기반 URL **`/api/{resource}`**, HTTP 메서드로 행위 표현. 동사형 경로 금지.
- 상태 코드를 의미대로: 생성 **201**(+`Location`), 삭제 **204**, 없음 **404**, 검증 실패 **400**.
- 필터/정렬/페이지는 쿼리 파라미터(`?status=&page=&size=`).

| 메서드 | 경로 | 의미 |
|--------|------|------|
| GET | `/api/tasks` · `/api/tasks/{id}` | 목록 / 단건 |
| POST | `/api/tasks` | 생성(201) |
| PUT | `/api/tasks/{id}` | 수정 |
| DELETE | `/api/tasks/{id}` | 삭제(204) |

## 예외 / 응답

- 예외는 **`@RestControllerAdvice` 전역 처리기**에서 일관된 형식(`ApiError`)으로 변환. **조용히 삼키지 않기.**
- 도메인 미존재 → 전용 예외(`ResourceNotFoundException`) → 404. 검증 위반(`MethodArgumentNotValidException`) → 400 + 필드별 메시지.

## 영속성 / 안전

- `ddl-auto`는 **교육용에서만 `create-drop`/`update`**, 운영은 **Flyway/Liquibase** 마이그레이션. `open-in-view: false`.
- **N+1 주의**: 연관 조회는 fetch join/`@EntityGraph`. 페이징 + 컬렉션 fetch 동시 사용 주의.
- 네이티브/JPQL은 **바인딩 파라미터**(`:param`)만 — ❌ 문자열 결합(SQL Injection). 하드코딩 시크릿 금지 → 환경변수/`application-*.yml`.

## 빌드 / 테스트

- **Gradle Wrapper**(`./gradlew`)로 빌드·실행: `./gradlew build` · `./gradlew bootRun`. JDK/Gradle 직접 설치 가정 금지.
- 테스트: JUnit 5 + Spring Test. 웹 계층은 `@SpringBootTest` + **MockMvc**(`@AutoConfigureMockMvc`).
- **Spring Boot 4 주의점**: Jackson 패키지가 **`tools.jackson`**(Jackson 3). `@AutoConfigureMockMvc`는 **`spring-boot-webmvc-test`** 모듈(`org.springframework.boot.webmvc.test.autoconfigure`)에 위치.

## 금지

- ❌ 필드 주입 / ❌ Controller 비즈니스 로직 / ❌ 엔티티 직접 노출·반환(DTO 분리)
- ❌ 무분별한 setter(상태는 도메인 메서드) / ❌ `@Enumerated(ORDINAL)` / ❌ 운영 `ddl-auto=update`·`create`
- ❌ 예외 조용히 삼키기 / ❌ 하드코딩 시크릿·접속정보 / ❌ 쿼리 문자열 결합(바인딩 사용) / ❌ `ResponseEntity` 없이 모호한 상태 코드
