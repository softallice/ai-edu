package com.aiedu.backend.pm.dto;

import com.aiedu.backend.pm.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/** 프로젝트 생성/수정 요청. 코드는 서비스에서 채번하므로 요청에 포함하지 않습니다. */
public record ProjectRequest(
        @NotBlank @Size(max = 200) String name,
        Long customerId,
        Long managerId,
        @NotNull ProjectStatus status,
        LocalDate dateStart,
        LocalDate dateEnd,
        Boolean active) {

    public boolean activeFlag() { return active == null || active; }
}
