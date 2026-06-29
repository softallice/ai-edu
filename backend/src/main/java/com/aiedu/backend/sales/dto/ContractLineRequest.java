package com.aiedu.backend.sales.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/** 계약 품목 요청. 금액은 서버에서 수량×단가로 계산합니다. */
public record ContractLineRequest(
        @NotBlank @Size(max = 200) String itemName,
        @Size(max = 200) String spec,
        BigDecimal quantity,
        BigDecimal unitPrice,
        @Size(max = 300) String remark) {

    public BigDecimal quantityOrOne() { return quantity == null ? BigDecimal.ONE : quantity; }
    public BigDecimal unitPriceOrZero() { return unitPrice == null ? BigDecimal.ZERO : unitPrice; }
}
