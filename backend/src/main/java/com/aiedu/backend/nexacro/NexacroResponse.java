package com.aiedu.backend.nexacro;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Nexacro 스타일 트랜잭션 응답 봉투(JSON).
 *
 * <p>레거시 ERP(ndserp)의 {@code ResponseData}(ErrorCode/ErrorMsg + 데이터셋) 규약을 JSON 으로
 * 모던화한 것입니다. Nexacro 폼은 {@code fnc_TransactionCall} 콜백에서 ErrorCode 가 0 이상이면
 * 성공, 음수면 실패로 처리합니다.
 */
public final class NexacroResponse {

    private NexacroResponse() {
    }

    /** 성공 봉투(ErrorCode=0). 이후 {@code put("ds_Xxx", rows)} 로 출력 데이터셋을 채웁니다. */
    public static Map<String, Object> ok() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("ErrorCode", 0);
        body.put("ErrorMsg", "SUCC");
        return body;
    }

    /** 실패 봉투(ErrorCode=-1). */
    public static Map<String, Object> error(String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("ErrorCode", -1);
        body.put("ErrorMsg", message);
        return body;
    }
}
