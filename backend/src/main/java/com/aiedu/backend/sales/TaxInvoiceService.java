package com.aiedu.backend.sales;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.customer.Customer;
import com.aiedu.backend.customer.CustomerRepository;
import com.aiedu.backend.sales.dto.TaxInvoiceRequest;
import com.aiedu.backend.sales.dto.TaxInvoiceResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class TaxInvoiceService {

    private static final BigDecimal VAT_RATE = new BigDecimal("0.1");

    private final TaxInvoiceRepository repository;
    private final CustomerRepository customerRepository;
    private final ContractRepository contractRepository;

    public TaxInvoiceService(TaxInvoiceRepository repository, CustomerRepository customerRepository,
            ContractRepository contractRepository) {
        this.repository = repository;
        this.customerRepository = customerRepository;
        this.contractRepository = contractRepository;
    }

    public List<TaxInvoiceResponse> search(String keyword, TaxInvoiceStatus status, Long customerId,
            LocalDate dateFrom, LocalDate dateTo) {
        Specification<TaxInvoice> spec = Specification.allOf(
                TaxInvoiceSpecifications.keyword(keyword),
                TaxInvoiceSpecifications.statusEquals(status),
                TaxInvoiceSpecifications.customerEquals(customerId),
                TaxInvoiceSpecifications.dateFrom(dateFrom),
                TaxInvoiceSpecifications.dateTo(dateTo));
        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "issueDate")).stream()
                .map(TaxInvoiceResponse::from).toList();
    }

    public TaxInvoiceResponse findById(Long id) {
        return TaxInvoiceResponse.from(getOrThrow(id));
    }

    @Transactional
    public TaxInvoiceResponse create(TaxInvoiceRequest req) {
        BigDecimal supply = req.supplyAmount();
        TaxInvoice t = TaxInvoice.create(generateCode(), resolveCustomer(req.customerId()),
                resolveContract(req.contractId()), req.issueDate(), supply, autoTax(supply, req.taxAmount()),
                req.status(), req.note());
        return TaxInvoiceResponse.from(repository.save(t));
    }

    @Transactional
    public TaxInvoiceResponse update(Long id, TaxInvoiceRequest req) {
        TaxInvoice t = getOrThrow(id);
        BigDecimal supply = req.supplyAmount();
        t.update(resolveCustomer(req.customerId()), resolveContract(req.contractId()), req.issueDate(), supply,
                autoTax(supply, req.taxAmount()), req.status(), req.note());
        return TaxInvoiceResponse.from(t);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private BigDecimal autoTax(BigDecimal supply, BigDecimal taxAmount) {
        if (taxAmount != null) return taxAmount;
        return supply.multiply(VAT_RATE).setScale(0, RoundingMode.HALF_UP);
    }

    private String generateCode() {
        String prefix = "TI-" + Year.now().getValue() + "-";
        long seq = repository.count() + 1;
        String code = prefix + String.format("%04d", seq);
        while (repository.existsByCode(code)) {
            seq++;
            code = prefix + String.format("%04d", seq);
        }
        return code;
    }

    private Customer resolveCustomer(Long customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("거래처를 찾을 수 없습니다. id=" + customerId));
    }

    private Contract resolveContract(Long contractId) {
        if (contractId == null) return null;
        return contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("계약을 찾을 수 없습니다. id=" + contractId));
    }

    private TaxInvoice getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("세금계산서를 찾을 수 없습니다. id=" + id));
    }
}
