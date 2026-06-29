package com.aiedu.backend.notice;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;

/**
 * 시스템안내/공지(Notice). 08.공통 / 공지 화면의 기준 엔티티.
 * FK 의존 없는 독립 엔티티.
 */
@Entity
@Table(name = "notices")
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 공지 번호(업무 키). 서비스에서 채번. 예: NT-2025-0001 */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 2000)
    private String content;

    @Column(length = 50)
    private String author;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NoticeCategory category;

    @Column(name = "posted_date")
    private LocalDate postedDate;

    /** 상단 고정 여부. */
    @Column(nullable = false)
    private boolean pinned = false;

    protected Notice() {
    }

    private Notice(String code, String title, String content, String author,
            NoticeCategory category, LocalDate postedDate, boolean pinned) {
        this.code = code;
        this.title = title;
        this.content = content;
        this.author = author;
        this.category = category;
        this.postedDate = postedDate;
        this.pinned = pinned;
    }

    public static Notice create(String code, String title, String content, String author,
            NoticeCategory category, LocalDate postedDate, boolean pinned) {
        return new Notice(code, title, content, author, category, postedDate, pinned);
    }

    /** 공지를 갱신합니다(번호는 불변). */
    public void update(String title, String content, String author,
            NoticeCategory category, LocalDate postedDate, boolean pinned) {
        this.title = title;
        this.content = content;
        this.author = author;
        this.category = category;
        this.postedDate = postedDate;
        this.pinned = pinned;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public String getAuthor() { return author; }
    public NoticeCategory getCategory() { return category; }
    public LocalDate getPostedDate() { return postedDate; }
    public boolean isPinned() { return pinned; }
}
