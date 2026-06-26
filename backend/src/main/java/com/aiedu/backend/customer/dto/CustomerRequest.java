package com.aiedu.backend.customer.dto;

import com.aiedu.backend.customer.TradeType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

/**
 * 거래처 생성/수정 요청 본문.
 *
 * <p>레거시 POVM0001 의 SAVE00(거래처+담당자 일괄 저장)에 대응합니다. Map 기반 untyped
 * 파라미터를 타입 안전한 record + Bean Validation 으로 모던화했습니다. 거래처코드(code)는
 * 서버에서 채번하므로 요청에 포함하지 않습니다.
 *
 * <p>선택 플래그(active/electronicContract)는 {@link Boolean} 으로 두어 본문에서 생략 가능하게
 * 하고, {@link #activeFlag()}/{@link #electronicContractFlag()} 에서 기본값으로 정규화합니다.
 * (Jackson 3 은 누락된 primitive boolean 역직렬화 시 오류를 내므로 래퍼 타입을 사용)
 */
public record CustomerRequest(
        @NotBlank @Size(max = 20) String businessRegNo,
        @NotBlank @Size(max = 200) String name,
        @Size(max = 100) String shortName,
        @NotNull TradeType tradeType,
        @Size(max = 100) String representativeName,
        @Size(max = 20) String corporateRegNo,
        @Size(max = 200) String businessCondition,
        @Size(max = 200) String businessItem,
        @Size(max = 10) String postNo,
        @Size(max = 300) String address1,
        @Size(max = 300) String address2,
        @Size(max = 30) String telNo,
        @Size(max = 30) String faxNo,
        @Email @Size(max = 200) String email,
        @Size(max = 10) String taxType,
        LocalDate foundDate,
        LocalDate tradeStartDate,
        LocalDate tradeEndDate,
        Boolean active,
        Boolean electronicContract,
        @Valid List<CustomerContactRequest> contacts) {

    /** 담당자 목록이 null 로 들어와도 빈 목록으로 다루도록 보정합니다. */
    public List<CustomerContactRequest> contacts() {
        return contacts == null ? List.of() : contacts;
    }

    /** 사용여부: 생략 시 기본 true(신규 거래처는 사용중). */
    public boolean activeFlag() {
        return active == null || active;
    }

    /** 전자계약 대상: 생략 시 기본 false. */
    public boolean electronicContractFlag() {
        return electronicContract != null && electronicContract;
    }
}
