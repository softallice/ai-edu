package com.aiedu.backend.task.dto;

import com.aiedu.backend.task.Task;
import com.aiedu.backend.task.TaskPriority;
import com.aiedu.backend.task.TaskStatus;

/** 작업 응답 본문. 엔티티를 외부에 직접 노출하지 않기 위한 표현 계층 DTO입니다. */
public record TaskResponse(
        Long id,
        String title,
        TaskStatus status,
        String label,
        TaskPriority priority) {

    /** 엔티티를 응답 DTO로 변환합니다. */
    public static TaskResponse from(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getStatus(),
                task.getLabel(),
                task.getPriority());
    }
}
