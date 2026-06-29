package com.aiedu.backend.hr.dto;

import com.aiedu.backend.hr.Department;

/** 부서 응답. parentName 은 서비스에서 채워줍니다. */
public record DepartmentResponse(
        Long id, String code, String name, int sequence, boolean active,
        Long parentId, String parentName) {

    public static DepartmentResponse from(Department d, String parentName) {
        return new DepartmentResponse(d.getId(), d.getCode(), d.getName(), d.getSequence(),
                d.isActive(), d.getParentId(), parentName);
    }
}
