package com.aiedu.backend.auth;

/** 이메일/비밀번호 불일치 또는 비활성 계정. 전역 예외 처리기에서 401 로 변환됩니다. */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
}
