package com.aiedu.backend.accounting.dto;

import jakarta.validation.constraints.NotBlank;

/** 세금그룹 생성/수정 요청. */
public record TaxGroupRequest(@NotBlank String code, @NotBlank String name, Boolean active) {
}
