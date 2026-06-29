package com.aiedu.backend.ga;

/** 인감 종류. 인감신청(SealRequest)에서 사용. */
public enum SealType {
    /** 사용인감 */
    USE,
    /** 법인인감 */
    CORPORATE,
    /** 사용인감반출 */
    USE_EXPORT,
    /** 지문인식기반출 */
    FINGERPRINT_EXPORT,
    /** 전자계약 */
    E_CONTRACT
}
