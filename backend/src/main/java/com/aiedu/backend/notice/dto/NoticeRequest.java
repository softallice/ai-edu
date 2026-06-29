package com.aiedu.backend.notice.dto;

import com.aiedu.backend.notice.NoticeCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/** 공지 생성/수정 요청. */
public record NoticeRequest(
        @NotBlank @Size(max = 200) String title,
        @Size(max = 2000) String content,
        @Size(max = 50) String author,
        @NotNull NoticeCategory category,
        LocalDate postedDate,
        boolean pinned) {
}
