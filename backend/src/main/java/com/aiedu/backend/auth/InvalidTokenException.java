package com.aiedu.backend.auth;

/** JWT 형식 오류·서명 불일치·만료. 전역 예외 처리기에서 401 로 변환됩니다. */
public class InvalidTokenException extends RuntimeException {

    public InvalidTokenException(String message) {
        super(message);
    }
}
