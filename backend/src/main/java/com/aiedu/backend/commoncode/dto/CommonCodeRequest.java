package com.aiedu.backend.commoncode.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 공통코드 생성/수정 요청. */
public record CommonCodeRequest(
        @NotBlank @Size(max = 50) String codeGroup,
        @NotBlank @Size(max = 50) String code,
        @NotBlank @Size(max = 100) String name,
        int sortOrder,
        boolean useYn,
        @Size(max = 300) String description) {
}
