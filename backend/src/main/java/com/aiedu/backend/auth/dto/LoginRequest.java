package com.aiedu.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** 로그인 요청. 레거시 ComLogin_Login.do 의 USER_IDXX/비밀번호 입력을 이메일 기반으로 모던화. */
public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password) {
}
