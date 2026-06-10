package com.aiedu.backend.task;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.aiedu.backend.task.dto.TaskRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

/**
 * 작업 REST API 통합 테스트.
 *
 * <p>전체 스프링 컨텍스트 + 인메모리 H2 + 시드 데이터를 사용해 컨트롤러→서비스→리포지토리
 * 경로를 검증합니다.
 */
@SpringBootTest
@AutoConfigureMockMvc
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void 목록조회는_시드데이터를_반환한다() throws Exception {
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(5)));
    }

    @Test
    void 작업생성은_201과_본문을_반환한다() throws Exception {
        TaskRequest request = new TaskRequest("새 작업", TaskStatus.TODO, "feature", TaskPriority.MEDIUM);

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.title").value("새 작업"))
                .andExpect(jsonPath("$.status").value("TODO"));
    }

    @Test
    void 검증실패_요청은_400을_반환한다() throws Exception {
        // title 이 비어 있어 @NotBlank 위반
        String invalid = """
                {"title":"","status":"TODO","label":"feature","priority":"LOW"}
                """;

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalid))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.title").exists());
    }

    @Test
    void 존재하지_않는_작업조회는_404를_반환한다() throws Exception {
        mockMvc.perform(get("/api/tasks/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
