package com.aiedu.backend.ga;

/** 지출품의 상태. */
public enum ExpenseStatus {
    /** 신청 */
    REQUESTED,
    /** 승인 */
    APPROVED,
    /** 지급 */
    PAID,
    /** 반려 */
    REJECTED
}
