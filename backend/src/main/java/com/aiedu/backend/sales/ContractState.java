package com.aiedu.backend.sales;

/** 계약 상태. koerp ContractState 를 NDS 영업 계약 흐름에 맞게 단순화 이관. */
public enum ContractState {
    DRAFT, SIGNED, IN_PROGRESS, DONE, TERMINATED
}
