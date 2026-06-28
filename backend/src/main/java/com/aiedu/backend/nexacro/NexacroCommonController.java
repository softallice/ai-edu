package com.aiedu.backend.nexacro;

import com.aiedu.backend.auth.AuthService;
import com.aiedu.backend.auth.InvalidCredentialsException;
import com.aiedu.backend.auth.dto.LoginRequest;
import com.aiedu.backend.auth.dto.LoginResponse;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Nexacro 연동 어댑터 — 공통(로그인/메뉴).
 *
 * <p>레거시 {@code ComLoginController}의 {@code ComLogin_Login.do}/{@code ComLogin_Mainframe.do}를
 * JSON 트랜잭션으로 모던화. 로그인은 모던 {@link AuthService}(JWT)에 위임하고, 메뉴는 교육용
 * 정적 목록을 반환합니다. 응답은 {@link NexacroResponse} 봉투(ErrorCode/ErrorMsg) 형식.
 */
@RestController
@RequestMapping("/nexacro/com")
public class NexacroCommonController {

    private final AuthService authService;

    public NexacroCommonController(AuthService authService) {
        this.authService = authService;
    }

    /** 로그인. 레거시 ComLogin_Login.do (입력 ds_Login: USER_ID, PASSWORD) */
    @PostMapping("/ComLogin_Login.do")
    public Map<String, Object> login(@RequestBody Map<String, Object> body) {
        Map<String, Object> p = firstRow(body, "ds_Login");
        String userId = str(p.get("USER_ID"));
        String password = str(p.get("PASSWORD"));
        try {
            LoginResponse res = authService.login(new LoginRequest(userId, password));
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

    /** 메뉴 목록. 레거시 ComLogin_Mainframe.do(메뉴) — 교육용 정적 메뉴. */
    @PostMapping("/ComLogin_Menu.do")
    public Map<String, Object> menu(@RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> ok = NexacroResponse.ok();
        ok.put("ds_Menu", List.of(
                menuRow("PO", "구매", "", "", "0"),
                menuRow("POVM0001", "거래처등록", "PO", "po::POVM0001.xfdl", "1")));
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
        if (body == null) {
            return Map.of();
        }
        Object ds = body.get(dataset);
        if (ds instanceof List<?> list && !list.isEmpty() && list.get(0) instanceof Map<?, ?> m) {
            return (Map<String, Object>) m;
        }
        if (ds instanceof Map<?, ?> m) {
            return (Map<String, Object>) m;
        }
        return Map.of();
    }

    private static String str(Object v) {
        return v == null ? "" : String.valueOf(v);
    }
}
