package com.aiedu.backend.nexacro;

import com.aiedu.backend.auth.AuthService;
import com.aiedu.backend.auth.InvalidCredentialsException;
import com.aiedu.backend.auth.dto.LoginRequest;
import com.aiedu.backend.auth.dto.LoginResponse;
import com.aiedu.backend.customer.CustomerService;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Nexacro 연동 어댑터 — 공통(로그인/메뉴/메인 대시보드).
 *
 * <p>레거시 {@code ComLoginController}의 로그인·메인프레임 처리(메뉴/사용자정보)를 JSON 트랜잭션으로
 * 모던화. 전체 프레임 마이그레이션 데모를 위해 카테고리형 메뉴와 홈 대시보드 통계를 제공합니다.
 */
@RestController
@RequestMapping("/nexacro/com")
public class NexacroCommonController {

    private final AuthService authService;
    private final CustomerService customerService;

    public NexacroCommonController(AuthService authService, CustomerService customerService) {
        this.authService = authService;
        this.customerService = customerService;
    }

    /** 로그인. 레거시 ComLogin_Login.do */
    @PostMapping("/ComLogin_Login.do")
    public Map<String, Object> login(@RequestBody Map<String, Object> body) {
        Map<String, Object> p = firstRow(body, "ds_Login");
        try {
            LoginResponse res = authService.login(
                    new LoginRequest(str(p.get("USER_ID")), str(p.get("PASSWORD"))));
            Map<String, Object> user = new LinkedHashMap<>();
            user.put("USER_ID", res.user().email());
            user.put("USER_NM", res.user().name());
            user.put("ACCOUNT_NO", res.user().accountNo());
            user.put("ROLE", String.join(",", res.user().role()));
            user.put("TOKEN", res.accessToken());
            Map<String, Object> ok = NexacroResponse.ok();
            ok.put("ds_UserInfo", List.of(user));
            return ok;
        } catch (InvalidCredentialsException ex) {
            return NexacroResponse.error(ex.getMessage());
        }
    }

    /**
     * 메뉴 목록(카테고리형). 레거시 ComLogin_Mainframe.do(메뉴).
     * MENU_LEVL 0=대분류, 1=프로그램. PROG_PATH 가 있으면 클릭 시 작업영역에 로드.
     */
    @PostMapping("/ComLogin_Menu.do")
    public Map<String, Object> menu(@RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> ok = NexacroResponse.ok();
        ok.put("ds_Menu", List.of(
                menuRow("PO", "구매관리", "", "", "0"),
                menuRow("POVM0001", "거래처등록", "PO", "po::POVM0001.xfdl", "1"),
                menuRow("POPP0001", "구매계획", "PO", "", "1"),
                menuRow("POTI0001", "세금계산서", "PO", "", "1"),
                menuRow("BASE", "기준정보", "", "", "0"),
                menuRow("COMM0001", "공통코드관리", "BASE", "", "1"),
                menuRow("COMM0002", "부서관리", "BASE", "", "1"),
                menuRow("SYS", "시스템관리", "", "", "0"),
                menuRow("SYSU0001", "사용자관리", "SYS", "", "1"),
                menuRow("SYSM0001", "메뉴관리", "SYS", "", "1")));
        return ok;
    }

    /** 홈 대시보드 통계. 메인화면(comMain)에서 호출. */
    @PostMapping("/ComMain_Stats.do")
    public Map<String, Object> mainStats(@RequestBody(required = false) Map<String, Object> body) {
        long custCount = customerService.search(null, null, null).size();
        long activeCount = customerService.search(null, true, null).size();
        Map<String, Object> stat = new LinkedHashMap<>();
        stat.put("CUST_CNT", custCount);
        stat.put("ACTIVE_CNT", activeCount);
        stat.put("PROG_CNT", 1);     // 이관 완료 프로그램 수(데모: 거래처등록)
        stat.put("TOTAL_PROG", 9);   // 전체 메뉴 프로그램 수
        Map<String, Object> ok = NexacroResponse.ok();
        ok.put("ds_Stats", List.of(stat));
        return ok;
    }

    private static Map<String, Object> menuRow(String id, String name, String upper, String path, String level) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("MENU_IDXX", id);
        row.put("MENU_NAME", name);
        row.put("UPME_IDXX", upper);
        row.put("PROG_PATH", path);
        row.put("MENU_LEVL", level);
        return row;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> firstRow(Map<String, Object> body, String dataset) {
        if (body == null) return Map.of();
        Object ds = body.get(dataset);
        if (ds instanceof List<?> list && !list.isEmpty() && list.get(0) instanceof Map<?, ?> m) return (Map<String, Object>) m;
        if (ds instanceof Map<?, ?> m) return (Map<String, Object>) m;
        return Map.of();
    }

    private static String str(Object v) { return v == null ? "" : String.valueOf(v); }
}
