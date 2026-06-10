package com.aiedu.backend.common;

/** 요청한 리소스를 찾지 못했을 때 던지는 예외. 전역 처리기에서 404로 변환됩니다. */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
