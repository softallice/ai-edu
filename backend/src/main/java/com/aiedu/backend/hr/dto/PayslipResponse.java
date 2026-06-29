package com.aiedu.backend.hr.dto;

import com.aiedu.backend.hr.Payslip;
import com.aiedu.backend.hr.PayslipStatus;
import java.math.BigDecimal;

/** 급여명세 응답(직원명·부서명 포함). */
public record PayslipResponse(
        Long id, String code,
        Long employeeId, String employeeName, String departmentName,
        String payMonth,
        BigDecimal baseSalary,
        BigDecimal allowance,
        BigDecimal bonus,
        BigDecimal deduction,
        BigDecimal netPay,
        PayslipStatus status,
        String note) {

    public static PayslipResponse from(Payslip p) {
        String deptName = p.getEmployee().getDepartment() != null
                ? p.getEmployee().getDepartment().getName()
                : null;
        return new PayslipResponse(
                p.getId(), p.getCode(),
                p.getEmployee().getId(),
                p.getEmployee().getName(),
                deptName,
                p.getPayMonth(),
                p.getBaseSalary(),
                p.getAllowance(),
                p.getBonus(),
                p.getDeduction(),
                p.getNetPay(),
                p.getStatus(),
                p.getNote());
    }
}
