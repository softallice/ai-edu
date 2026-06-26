package com.aiedu.backend.customer;

/**
 * 거래처의 매입/매출 구분.
 *
 * <p>레거시 ERP(ndserp POVM0001)의 {@code BUY_SALE_GB} 코드 컬럼을 의미가 드러나는
 * enum 으로 모던화한 것입니다. 문자열 코드 대신 타입으로 다뤄 잘못된 값이 컴파일 단계에서
 * 걸러지도록 합니다.
 */
public enum TradeType {
    /** 매입처 */
    BUY,
    /** 매출처 */
    SALE,
    /** 매입·매출 모두 */
    BOTH
}
