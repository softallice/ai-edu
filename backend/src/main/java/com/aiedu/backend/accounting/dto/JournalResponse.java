package com.aiedu.backend.accounting.dto;

import com.aiedu.backend.accounting.Journal;
import com.aiedu.backend.accounting.JournalType;

/** 장부 응답. */
public record JournalResponse(Long id, String code, String name, JournalType type, String sequencePrefix, boolean active) {
    public static JournalResponse from(Journal j) {
        return new JournalResponse(j.getId(), j.getCode(), j.getName(), j.getType(), j.getSequencePrefix(), j.isActive());
    }
}
