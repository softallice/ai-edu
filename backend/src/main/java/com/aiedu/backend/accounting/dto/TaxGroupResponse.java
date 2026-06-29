package com.aiedu.backend.accounting.dto;

import com.aiedu.backend.accounting.TaxGroup;

/** 세금그룹 응답. */
public record TaxGroupResponse(Long id, String code, String name, boolean active) {
    public static TaxGroupResponse from(TaxGroup g) {
        return new TaxGroupResponse(g.getId(), g.getCode(), g.getName(), g.isActive());
    }
}
