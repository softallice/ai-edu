package com.aiedu.backend.notice.dto;

import com.aiedu.backend.notice.Notice;
import com.aiedu.backend.notice.NoticeCategory;
import java.time.LocalDate;

/** 공지 응답. */
public record NoticeResponse(
        Long id,
        String code,
        String title,
        String content,
        String author,
        NoticeCategory category,
        LocalDate postedDate,
        boolean pinned) {

    public static NoticeResponse from(Notice n) {
        return new NoticeResponse(
                n.getId(),
                n.getCode(),
                n.getTitle(),
                n.getContent(),
                n.getAuthor(),
                n.getCategory(),
                n.getPostedDate(),
                n.isPinned());
    }
}
