package com.aiedu.backend.pm.dto;

import com.aiedu.backend.pm.Project;
import com.aiedu.backend.pm.ProjectStatus;
import java.time.LocalDate;

/** 프로젝트 응답(고객명·PM명 포함). */
public record ProjectResponse(
        Long id, String code, String name,
        Long customerId, String customerName,
        Long managerId, String managerName,
        ProjectStatus status, LocalDate dateStart, LocalDate dateEnd, boolean active) {

    public static ProjectResponse from(Project p) {
        return new ProjectResponse(
                p.getId(), p.getCode(), p.getName(),
                p.getCustomer() == null ? null : p.getCustomer().getId(),
                p.getCustomer() == null ? null : p.getCustomer().getName(),
                p.getManager() == null ? null : p.getManager().getId(),
                p.getManager() == null ? null : p.getManager().getName(),
                p.getStatus(), p.getDateStart(), p.getDateEnd(), p.isActive());
    }
}
