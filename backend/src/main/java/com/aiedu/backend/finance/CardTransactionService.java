package com.aiedu.backend.finance;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.finance.dto.CardTransactionRequest;
import com.aiedu.backend.finance.dto.CardTransactionResponse;
import com.aiedu.backend.hr.Employee;
import com.aiedu.backend.hr.EmployeeRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 법인카드 거래내역 서비스. */
@Service
@Transactional(readOnly = true)
public class CardTransactionService {

    private final CardTransactionRepository repository;
    private final EmployeeRepository employeeRepository;

    public CardTransactionService(CardTransactionRepository repository,
            EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
    }

    /** 법인카드 거래내역 목록 검색. */
    public List<CardTransactionResponse> search(String keyword, CardTransactionStatus status,
            String billingMonth, LocalDate dateFrom, LocalDate dateTo) {
        Specification<CardTransaction> spec = Specification.allOf(
                CardTransactionSpecifications.keyword(keyword),
                CardTransactionSpecifications.statusEquals(status),
                CardTransactionSpecifications.billingMonthEquals(billingMonth),
                CardTransactionSpecifications.dateFrom(dateFrom),
                CardTransactionSpecifications.dateTo(dateTo));
        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "usedDate")).stream()
                .map(CardTransactionResponse::from).toList();
    }

    /** 법인카드 거래내역 단건 조회. */
    public CardTransactionResponse findById(Long id) {
        return CardTransactionResponse.from(getOrThrow(id));
    }

    /** 법인카드 거래내역 등록. */
    @Transactional
    public CardTransactionResponse create(CardTransactionRequest req) {
        CardTransaction c = CardTransaction.create(
                generateCode(),
                req.cardNo(),
                req.usedDate(),
                req.merchant(),
                req.approvalAmount() != null ? req.approvalAmount() : BigDecimal.ZERO,
                req.purchaseAmount() != null ? req.purchaseAmount() : BigDecimal.ZERO,
                req.billingMonth(),
                req.status(),
                resolveEmployee(req.employeeId()),
                req.description());
        return CardTransactionResponse.from(repository.save(c));
    }

    /** 법인카드 거래내역 수정. */
    @Transactional
    public CardTransactionResponse update(Long id, CardTransactionRequest req) {
        CardTransaction c = getOrThrow(id);
        c.update(
                req.cardNo(),
                req.usedDate(),
                req.merchant(),
                req.approvalAmount() != null ? req.approvalAmount() : BigDecimal.ZERO,
                req.purchaseAmount() != null ? req.purchaseAmount() : BigDecimal.ZERO,
                req.billingMonth(),
                req.status(),
                resolveEmployee(req.employeeId()),
                req.description());
        return CardTransactionResponse.from(c);
    }

    /** 법인카드 거래내역 삭제. */
    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private String generateCode() {
        String prefix = "CC-" + Year.now().getValue() + "-";
        long seq = repository.count() + 1;
        String code = prefix + String.format("%04d", seq);
        while (repository.existsByCode(code)) {
            seq++;
            code = prefix + String.format("%04d", seq);
        }
        return code;
    }

    private Employee resolveEmployee(Long employeeId) {
        if (employeeId == null) return null;
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "직원을 찾을 수 없습니다. id=" + employeeId));
    }

    private CardTransaction getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "법인카드 거래내역을 찾을 수 없습니다. id=" + id));
    }
}
