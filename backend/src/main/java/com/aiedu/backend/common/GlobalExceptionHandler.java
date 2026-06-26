package com.aiedu.backend.common;

import com.aiedu.backend.auth.InvalidCredentialsException;
import com.aiedu.backend.auth.InvalidTokenException;
import com.aiedu.backend.customer.DuplicateBusinessRegNoException;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 전역 예외 처리기.
 *
 * <p>컨트롤러에서 던진 예외를 일관된 {@link ApiError} 형식으로 변환합니다.
 * 에러를 조용히 삼키지 않고 적절한 HTTP 상태로 매핑하되, 예기치 못한 예외의 내부 정보(스택트레이스 등)는
 * 클라이언트에 노출하지 않고 서버 로그에만 남깁니다.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** 리소스 미존재 → 404. */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex) {
        ApiError body = ApiError.of(
                HttpStatus.NOT_FOUND.value(),
                HttpStatus.NOT_FOUND.getReasonPhrase(),
                ex.getMessage(),
                Map.of());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    /** 업무 규칙 위반(사업자번호 중복) → 409. */
    @ExceptionHandler(DuplicateBusinessRegNoException.class)
    public ResponseEntity<ApiError> handleDuplicate(DuplicateBusinessRegNoException ex) {
        ApiError body = ApiError.of(
                HttpStatus.CONFLICT.value(),
                HttpStatus.CONFLICT.getReasonPhrase(),
                ex.getMessage(),
                Map.of());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    /** DB 무결성 제약 위반(유니크 등, 예: 동시 생성 시 코드 충돌) → 409. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleIntegrity(DataIntegrityViolationException ex) {
        log.warn("data_integrity_violation", ex);
        ApiError body = ApiError.of(
                HttpStatus.CONFLICT.value(),
                HttpStatus.CONFLICT.getReasonPhrase(),
                "데이터 무결성 제약을 위반했습니다(중복 값 가능성).",
                Map.of());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    /** 자격 증명 오류(이메일/비밀번호 불일치, 비활성 계정) → 401. */
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiError> handleInvalidCredentials(InvalidCredentialsException ex) {
        ApiError body = ApiError.of(
                HttpStatus.UNAUTHORIZED.value(),
                HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                ex.getMessage(),
                Map.of());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    /** 토큰 누락·형식오류·서명불일치·만료 → 401. */
    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<ApiError> handleInvalidToken(InvalidTokenException ex) {
        ApiError body = ApiError.of(
                HttpStatus.UNAUTHORIZED.value(),
                HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                ex.getMessage(),
                Map.of());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    /** Bean Validation 위반 → 400 + 필드별 메시지. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        ApiError body = ApiError.of(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "입력값 검증에 실패했습니다.",
                fieldErrors);
        return ResponseEntity.badRequest().body(body);
    }

    /** 그 외 예기치 못한 예외 → 500. 내부 정보는 로그에만, 클라이언트에는 일반 메시지만. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex) {
        log.error("unexpected_error", ex);
        ApiError body = ApiError.of(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                "서버 오류가 발생했습니다.",
                Map.of());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
