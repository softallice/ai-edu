package com.aiedu.backend.common;

import java.time.Instant;
import java.util.Map;

/**
 * 표준 에러 응답 형식.
 *
 * @param timestamp 발생 시각(ISO-8601)
 * @param status    HTTP 상태 코드
 * @param error     상태 코드 설명
 * @param message   사람이 읽을 수 있는 메시지
 * @param fieldErrors 필드별 검증 오류(없으면 빈 맵)
 */
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        Map<String, String> fieldErrors) {

    public static ApiError of(int status, String error, String message, Map<String, String> fieldErrors) {
        return new ApiError(Instant.now(), status, error, message, fieldErrors);
    }
}
