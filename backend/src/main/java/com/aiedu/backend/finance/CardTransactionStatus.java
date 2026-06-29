package com.aiedu.backend.finance;

/** 법인카드 거래 상태. 승인 → 매입확정 → 청구 → 결제완료 흐름. */
public enum CardTransactionStatus {
    APPROVED,   // 승인
    PURCHASED,  // 매입확정
    BILLED,     // 청구
    PAID        // 결제완료
}
