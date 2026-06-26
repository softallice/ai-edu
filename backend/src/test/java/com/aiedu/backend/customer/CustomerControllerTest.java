package com.aiedu.backend.customer;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/**
 * 거래처 REST API 통합 테스트.
 *
 * <p>전체 스프링 컨텍스트 + 인메모리 H2 + 시드 데이터(CustomerDataInitializer)를 사용해
 * 컨트롤러→서비스→리포지토리 경로를 검증합니다. 레거시 POVM0001 의 핵심 시나리오
 * (목록/필터/생성/수정/삭제/검증/중복/404)를 모던 스택에서 재현합니다.
 *
 * <p>시드: 000001 엔디에스(BOTH, active, 사업번호 1078647093), 000002 ACME(BUY, active),
 * 000003 구거래상사(SALE, inactive).
 */
@SpringBootTest
@AutoConfigureMockMvc
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void 목록조회는_시드데이터를_반환한다() throws Exception {
        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(3)));
    }

    @Test
    void 키워드로_거래처를_필터링한다() throws Exception {
        mockMvc.perform(get("/api/customers").param("keyword", "엔디에스"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$[0].name").value("엔디에스(주)"));
    }

    @Test
    void 매입매출구분으로_필터링한다() throws Exception {
        mockMvc.perform(get("/api/customers").param("tradeType", "SALE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.tradeType != 'SALE')]").isEmpty());
    }

    @Test
    void 사용여부로_필터링한다() throws Exception {
        mockMvc.perform(get("/api/customers").param("active", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.active == true)]").isEmpty());
    }

    @Test
    void 사업자번호_중복확인_엔드포인트() throws Exception {
        mockMvc.perform(get("/api/customers/check-business-reg-no").param("businessRegNo", "1078647093"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.duplicate").value(true));
        mockMvc.perform(get("/api/customers/check-business-reg-no").param("businessRegNo", "0000000000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.duplicate").value(false));
    }

    @Test
    void 거래처생성은_201과_채번된코드_담당자를_반환한다() throws Exception {
        String body = """
                {
                  "businessRegNo": "9998887776",
                  "name": "신규 거래처",
                  "tradeType": "BUY",
                  "representativeName": "김신규",
                  "foundDate": "2024-01-15",
                  "active": true,
                  "electronicContract": false,
                  "contacts": [
                    {"department": "구매팀", "name": "이담당", "telNo": "02-111-2222", "email": "lee@new.co.kr"}
                  ]
                }
                """;

        mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.code").isNotEmpty())
                .andExpect(jsonPath("$.name").value("신규 거래처"))
                .andExpect(jsonPath("$.tradeType").value("BUY"))
                .andExpect(jsonPath("$.foundDate").value("2024-01-15"))
                .andExpect(jsonPath("$.contacts.length()").value(1))
                .andExpect(jsonPath("$.contacts[0].name").value("이담당"));
    }

    @Test
    void 거래처를_생성하고_수정하면_담당자가_동기화된다() throws Exception {
        String create = """
                {"businessRegNo":"7776665554","name":"수정대상","tradeType":"SALE",
                 "contacts":[{"department":"영업","name":"홍담당"}]}
                """;
        String location = mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON).content(create))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getHeader("Location");

        // 담당자를 2명으로 교체하고 이름 변경
        String update = """
                {"businessRegNo":"7776665554","name":"수정완료","tradeType":"BOTH","active":false,
                 "contacts":[
                   {"department":"총무","name":"갑담당"},
                   {"department":"구매","name":"을담당"}
                 ]}
                """;
        mockMvc.perform(put(location)
                        .contentType(MediaType.APPLICATION_JSON).content(update))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("수정완료"))
                .andExpect(jsonPath("$.tradeType").value("BOTH"))
                .andExpect(jsonPath("$.active").value(false))
                .andExpect(jsonPath("$.contacts.length()").value(2));
    }

    @Test
    void 거래처를_삭제하면_204이후_404다() throws Exception {
        String create = """
                {"businessRegNo":"6665554443","name":"삭제대상","tradeType":"BUY"}
                """;
        String location = mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON).content(create))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getHeader("Location");

        mockMvc.perform(delete(location)).andExpect(status().isNoContent());
        mockMvc.perform(get(location)).andExpect(status().isNotFound());
    }

    @Test
    void 이름이_비면_400을_반환한다() throws Exception {
        String invalid = """
                {"businessRegNo":"1112223334","name":"","tradeType":"SALE","active":true}
                """;

        mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalid))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").exists());
    }

    @Test
    void 사업자번호가_중복되면_409를_반환한다() throws Exception {
        // 시드 거래처(엔디에스)의 사업자번호와 동일
        String dup = """
                {"businessRegNo":"1078647093","name":"중복 거래처","tradeType":"BUY","active":true}
                """;

        mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(dup))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void 존재하지_않는_거래처조회는_404를_반환한다() throws Exception {
        mockMvc.perform(get("/api/customers/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
