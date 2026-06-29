package com.aiedu.backend.hr.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 부서 생성/수정 요청. */
public record DepartmentRequest(
        @NotBlank @Size(max = 30) String code,
        @NotBlank @Size(max = 100) String name,
        Integer sequence,
        Boolean active,
        Long parentId) {

    public int sequenceOrDefault() { return sequence == null ? 10 : sequence; }
    public boolean activeFlag() { return active == null || active; }
}
