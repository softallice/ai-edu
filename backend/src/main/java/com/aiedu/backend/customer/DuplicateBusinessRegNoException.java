package com.aiedu.backend.customer;

/**
 * 사업자번호가 이미 등록된 경우 던지는 예외. 전역 예외 처리기에서 409(Conflict)로 변환됩니다.
 * 레거시 POVM0001 의 중복 체크(SEARCH03) 실패 상황을 명시적 예외로 모던화한 것입니다.
 */
public class DuplicateBusinessRegNoException extends RuntimeException {

    public DuplicateBusinessRegNoException(String businessRegNo) {
        super("이미 등록된 사업자번호입니다: " + businessRegNo);
    }
}
