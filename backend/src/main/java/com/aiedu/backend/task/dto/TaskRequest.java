package com.aiedu.backend.task.dto;

import com.aiedu.backend.task.TaskPriority;
import com.aiedu.backend.task.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 작업 생성/수정 요청 본문.
 *
 * <p>Bean Validation 으로 입력을 검증합니다. 위반 시 {@code 400} 과
 * 필드별 오류가 응답됩니다(전역 예외 처리 참고).
 */
public record TaskRequest(
        @NotBlank @Size(max = 200) String title,
        @NotNull TaskStatus status,
        @NotBlank @Size(max = 50) String label,
        @NotNull TaskPriority priority) {
}
