package com.aiedu.backend.accounting;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 분개전표(JournalEntry). 회계 분개 전표 엔티티.
 * 전표 라인({@link JournalEntryLine}) 목록을 포함하며, 라인 추가는 {@link #addLine}으로 처리.
 */
@Entity
@Table(name = "journal_entry")
public class JournalEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 전표 번호(업무 키). 유일. */
    @Column(nullable = false, unique = true, length = 40)
    private String name;

    /** 전표 일자(필수). */
    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    /** 참조 번호. 선택. */
    @Column(length = 100)
    private String ref;

    /** 소속 장부. 선택. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_id")
    private Journal journal;

    /** 원천 문서 유형. 선택. */
    @Column(name = "source_type", length = 50)
    private String sourceType;

    /** 원천 문서 식별자. 선택. */
    @Column(name = "source_id", length = 100)
    private String sourceId;

    /** 생성 일시. 변경 불가. */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /** 전표 라인 목록. */
    @OneToMany(mappedBy = "entry", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JournalEntryLine> lines = new ArrayList<>();

    protected JournalEntry() {
    }

    private JournalEntry(String name, LocalDate entryDate, String ref, Journal journal,
            String sourceType, String sourceId) {
        this.name = name;
        this.entryDate = entryDate;
        this.ref = ref;
        this.journal = journal;
        this.sourceType = sourceType;
        this.sourceId = sourceId;
        this.createdAt = Instant.now();
    }

    /** 분개전표를 생성합니다. */
    public static JournalEntry create(String name, LocalDate entryDate, String ref, Journal journal,
            String sourceType, String sourceId) {
        return new JournalEntry(name, entryDate, ref, journal, sourceType, sourceId);
    }

    /**
     * 전표 라인을 추가합니다.
     * 라인의 entry 참조를 이 전표로 설정한 후 목록에 추가합니다.
     */
    public void addLine(JournalEntryLine line) {
        lines.add(line);
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public LocalDate getEntryDate() { return entryDate; }
    public String getRef() { return ref; }
    public Journal getJournal() { return journal; }
    public String getSourceType() { return sourceType; }
    public String getSourceId() { return sourceId; }
    public Instant getCreatedAt() { return createdAt; }
    public List<JournalEntryLine> getLines() { return Collections.unmodifiableList(lines); }
}
