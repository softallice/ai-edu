package com.aiedu.backend.customer.dto;

/** 사업자번호 중복 확인 결과. 레거시 SEARCH03(중복 카운트)을 boolean 으로 모던화. */
public record DuplicateCheckResponse(boolean duplicate) {
}
