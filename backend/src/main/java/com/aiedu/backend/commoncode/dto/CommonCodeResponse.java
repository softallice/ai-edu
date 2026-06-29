package com.aiedu.backend.commoncode.dto;

import com.aiedu.backend.commoncode.CommonCode;

/** 공통코드 응답. */
public record CommonCodeResponse(
        Long id,
        String codeGroup,
        String code,
        String name,
        int sortOrder,
        boolean useYn,
        String description) {

    public static CommonCodeResponse from(CommonCode c) {
        return new CommonCodeResponse(
                c.getId(),
                c.getCodeGroup(),
                c.getCode(),
                c.getName(),
                c.getSortOrder(),
                c.isUseYn(),
                c.getDescription());
    }
}
