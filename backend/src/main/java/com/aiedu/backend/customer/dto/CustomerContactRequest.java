package com.aiedu.backend.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 거래처 담당자 생성/수정 요청. */
public record CustomerContactRequest(
        @NotBlank @Size(max = 100) String department,
        @NotBlank @Size(max = 100) String name,
        @Size(max = 30) String telNo,
        @Email @Size(max = 200) String email) {
}
