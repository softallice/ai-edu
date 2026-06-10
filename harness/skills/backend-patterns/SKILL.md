---
name: backend-patterns
description: Backend patterns for the ai-edu Spring Boot stack — layered REST (Controller/Service/Repository), Spring Data JPA, DTO records, Bean Validation, global error handling.
origin: ECC (adapted for ai-edu/backend)
---

# Backend Development Patterns

`ai-edu/backend`(Spring Boot 4 + Java + Gradle + Spring Data JPA)의 실제 스택에 맞춘 백엔드 패턴입니다.
모든 예제는 이 코드베이스의 계층 구조와 코드 스타일을 따릅니다.

## 스택 / 활성화 시점

Spring Boot 4.x · Java(Gradle toolchain) · `spring-boot-starter-web`(`@RestController`) · **Spring Data JPA** + H2/PostgreSQL · `spring-boot-starter-validation` · **Jackson 3**(`tools.jackson`).

- REST 엔드포인트 설계, Controller/Service/Repository 계층 구현
- JPA 매핑·쿼리 최적화(N+1, 페이징), 트랜잭션 경계
- 입력 검증·전역 예외 처리, DTO 변환

## 계층 구조 (도메인별 패키지)

```
com.aiedu.backend/
├─ task/                      # 도메인 패키지
│  ├─ TaskController          # @RestController (얇게)
│  ├─ TaskService             # @Service (비즈니스 + 트랜잭션)
│  ├─ TaskRepository          # JpaRepository
│  ├─ Task                    # @Entity
│  └─ dto/ TaskRequest, TaskResponse
└─ common/                    # GlobalExceptionHandler, ApiError ...
```

규칙: **Controller는 얇게**(요청 수신·검증 위임·서비스 호출·응답 매핑) · **Service에 비즈니스 로직과 트랜잭션 경계** · **Repository는 데이터 접근만** · **Entity는 표현/요청과 분리**.

## Controller — 얇게, REST

```java
@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskService taskService;
    public TaskController(TaskService taskService) { this.taskService = taskService; }

    @GetMapping
    public List<TaskResponse> list() { return taskService.findAll(); }

    @PostMapping
    public ResponseEntity<TaskResponse> create(@Valid @RequestBody TaskRequest request) {
        TaskResponse created = taskService.create(request);
        return ResponseEntity.created(URI.create("/api/tasks/" + created.id())).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        taskService.delete(id);
        return ResponseEntity.noContent().build();  // 204
    }
}
```

- 리소스 URL `/api/{resource}`, 상태 코드 의미대로(201+`Location`, 204, 404, 400).
- `@Valid`로 요청 검증을 트리거(검증 규칙은 DTO에).

## Service — 비즈니스 + 트랜잭션, 생성자 주입

```java
@Service
@Transactional(readOnly = true)          // 조회 기본 readOnly
public class TaskService {
    private final TaskRepository taskRepository;
    public TaskService(TaskRepository taskRepository) {  // 생성자 주입(필드 주입 금지)
        this.taskRepository = taskRepository;
    }

    @Transactional                        // 쓰기에만 트랜잭션
    public TaskResponse create(TaskRequest req) {
        Task task = Task.create(req.title(), req.status(), req.label(), req.priority());
        return TaskResponse.from(taskRepository.save(task));
    }

    public TaskResponse findById(Long id) {
        return TaskResponse.from(getOrThrow(id));
    }

    private Task getOrThrow(Long id) {
        return taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("작업을 찾을 수 없습니다. id=" + id));
    }
}
```

## Repository — Spring Data JPA

```java
public interface TaskRepository extends JpaRepository<Task, Long> {
    // 파생 쿼리: List<Task> findByStatus(TaskStatus status);
    // 연관 조회는 @EntityGraph 또는 fetch join 으로 N+1 방지
}
```

## Entity — 캡슐화

```java
@Entity
@Table(name = "tasks")
public class Task {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)          // ❌ ORDINAL
    @Column(nullable = false)
    private TaskStatus status;

    protected Task() {}                    // JPA 전용 기본 생성자

    private Task(String title, TaskStatus status) { this.title = title; this.status = status; }

    public static Task create(String title, TaskStatus status) {  // 정적 팩터리
        return new Task(title, status);
    }

    public void update(String title, TaskStatus status) {          // 도메인 메서드(무분별 setter 금지)
        this.title = title; this.status = status;
    }
    // getter ...
}
```

## DTO — record + Bean Validation

엔티티를 직접 노출/반환하지 않고 요청/응답 record로 분리합니다.

```java
public record TaskRequest(
    @NotBlank @Size(max = 200) String title,
    @NotNull TaskStatus status) {}

public record TaskResponse(Long id, String title, TaskStatus status) {
    public static TaskResponse from(Task t) {     // 엔티티 → 응답 변환
        return new TaskResponse(t.getId(), t.getTitle(), t.getStatus());
    }
}
```

## 전역 예외 처리 — 일관된 ApiError

예외를 조용히 삼키지 않고 `@RestControllerAdvice`에서 표준 형식으로 변환합니다.

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiError.of(404, "Not Found", ex.getMessage(), Map.of()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors())
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
        return ResponseEntity.badRequest()
            .body(ApiError.of(400, "Bad Request", "입력값 검증 실패", fieldErrors));
    }
}
```

## 영속성 / 안전

- `ddl-auto`는 **교육용에서만** `create-drop`/`update`, 운영은 **Flyway/Liquibase**. `open-in-view: false`.
- **N+1 방지**: 연관은 fetch join/`@EntityGraph`. 페이징 + 컬렉션 fetch 동시 사용 주의.
- 네이티브/JPQL은 **바인딩 파라미터**(`:param`)만 — ❌ 문자열 결합(SQL Injection). 시크릿은 환경변수/`application-*.yml`.

## 빌드 / 테스트

- **Gradle Wrapper**: `./gradlew build`, `./gradlew bootRun`.
- 웹 계층 테스트: `@SpringBootTest` + `@AutoConfigureMockMvc` + MockMvc(목록/생성/검증실패/404).
- **Spring Boot 4 주의점**: Jackson 3 패키지는 **`tools.jackson`**. `@AutoConfigureMockMvc`는 **`spring-boot-webmvc-test`** 모듈에 위치(테스트 의존성 추가 필요).

```java
@SpringBootTest
@AutoConfigureMockMvc
class TaskControllerTest {
    @Autowired MockMvc mockMvc;

    @Test
    void 검증실패_요청은_400을_반환한다() throws Exception {
        mockMvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"\",\"status\":\"TODO\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.fieldErrors.title").exists());
    }
}
```

**핵심**: Controller는 얇게·Service에 비즈니스와 트랜잭션·Repository는 데이터 접근·Entity는 캡슐화. 요청/응답은 record DTO로 엔티티와 분리하고, 입력은 Bean Validation·예외는 전역 처리기로 일관되게.
