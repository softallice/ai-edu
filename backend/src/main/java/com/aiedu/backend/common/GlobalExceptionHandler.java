package com.aiedu.backend.common;

import java.util.HashMap;
import java.util.Map;
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
 * 에러를 조용히 삼키지 않고 적절한 HTTP 상태로 매핑하는 것이 핵심입니다.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

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
}
