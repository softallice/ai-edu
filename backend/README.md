# ai-edu 백엔드 — Spring Boot 교육용 템플릿

`spring-projects/spring-boot` 공식 구조를 기준으로 구성한 **모던 Spring Boot REST API** 교육용 템플릿입니다.
프론트엔드(`../frontend`, shadcn-admin)의 `features/tasks` 와 도메인을 맞춘 **작업(Task) 관리 API**를 제공합니다.

## 스택

| 분류 | 내용 |
|------|------|
| 런타임 | **Java 25** (Gradle toolchain) |
| 프레임워크 | **Spring Boot 4.0.6** (Spring Framework 7) |
| 빌드 | **Gradle** (Wrapper 포함 — JDK/Gradle 사전 설치 불필요) |
| 웹 | `spring-boot-starter-web` (`@RestController`, REST URL) |
| 영속성 | `spring-boot-starter-data-jpa` + **H2**(인메모리) |
| 검증 | `spring-boot-starter-validation` (Bean Validation) |
| 직렬화 | **Jackson 3** (`tools.jackson`) — Spring Boot 4 기본 |
| 테스트 | JUnit 5 + Spring Test(MockMvc) |

## 실행

```bash
cd backend
./gradlew bootRun          # http://localhost:8080
# 빌드 + 테스트
./gradlew build
# 테스트만
./gradlew test
```

> 최초 실행 시 Gradle Wrapper가 Gradle 배포본과 의존성을 내려받습니다(네트워크 필요).
> 폐쇄망에서는 의존성을 사전 캐싱해야 합니다(`../docs/3.폐쇄망-GPU서버-아키텍처.md` 참고).

## REST API

| 메서드 | 경로 | 설명 | 상태 |
|--------|------|------|------|
| `GET` | `/api/tasks` | 작업 목록 | 200 |
| `GET` | `/api/tasks/{id}` | 단건 조회 | 200 / 404 |
| `POST` | `/api/tasks` | 생성 | 201 / 400 |
| `PUT` | `/api/tasks/{id}` | 수정 | 200 / 400 / 404 |
| `DELETE` | `/api/tasks/{id}` | 삭제 | 204 / 404 |

요청 본문 예시:

```json
{ "title": "회원 가입 폼 검증 추가", "status": "TODO", "label": "feature", "priority": "HIGH" }
```

- `status`: `BACKLOG | TODO | IN_PROGRESS | DONE | CANCELED`
- `priority`: `LOW | MEDIUM | HIGH`

빠른 확인:

```bash
curl http://localhost:8080/api/tasks
curl -X POST http://localhost:8080/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"새 작업","status":"TODO","label":"feature","priority":"MEDIUM"}'
```

H2 콘솔: `http://localhost:8080/h2-console` (JDBC URL `jdbc:h2:mem:aiedu`, user `sa`).

## 계층 구조

```
src/main/java/com/aiedu/backend/
├─ BackendApplication.java        # 진입점
├─ task/                          # 작업 도메인
│  ├─ Task.java                   # @Entity (도메인 메서드 캡슐화)
│  ├─ TaskStatus.java / TaskPriority.java   # enum
│  ├─ TaskRepository.java         # Spring Data JPA
│  ├─ TaskService.java            # 비즈니스 로직 + 트랜잭션 경계
│  ├─ TaskController.java         # @RestController (얇게 유지)
│  └─ dto/
│     ├─ TaskRequest.java         # record + Bean Validation
│     └─ TaskResponse.java        # record (엔티티 비노출)
└─ common/
   ├─ GlobalExceptionHandler.java # @RestControllerAdvice
   ├─ ApiError.java               # 표준 에러 응답
   └─ ResourceNotFoundException.java
```

설계 원칙(컨벤션 정렬):

- **컨트롤러는 얇게** — 요청 수신·검증 위임·서비스 호출·응답 매핑만.
- **비즈니스 로직은 서비스**, 트랜잭션 경계도 서비스(조회는 `readOnly`).
- **생성자 주입**(필드 주입 금지).
- **엔티티를 직접 노출하지 않고** 요청/응답 DTO(record) 분리.
- 입력 검증은 Bean Validation, 예외는 전역 처리기에서 일관된 형식으로 변환.

## 테스트

```bash
./gradlew test
```

- `BackendApplicationTests` — 컨텍스트 로딩 스모크 테스트.
- `TaskControllerTest` — `@SpringBootTest` + MockMvc 통합 테스트(목록/생성/검증실패/404).

## 하네스 연동

ai-edu 하네스와 함께 쓰면 `egov-backend`/`backend-patterns` 컨벤션과 PDCA 루프를 이 템플릿에 적용할 수 있습니다.
자세한 내용은 `../docs/6.프론트엔드-템플릿-구조.md` 5장(백엔드)과 `../docs/2.PDCA-방법론.md`를 참고하세요.
