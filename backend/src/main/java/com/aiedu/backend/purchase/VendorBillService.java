package com.aiedu.backend.purchase;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.customer.Customer;
import com.aiedu.backend.customer.CustomerRepository;
import com.aiedu.backend.purchase.dto.VendorBillRequest;
import com.aiedu.backend.purchase.dto.VendorBillResponse;
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
public class VendorBillService {

    private static final BigDecimal VAT_RATE = new BigDecimal("0.1");

    private final VendorBillRepository repository;
    private final CustomerRepository customerRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public VendorBillService(VendorBillRepository repository, CustomerRepository customerRepository,
            PurchaseOrderRepository purchaseOrderRepository) {
        this.repository = repository;
        this.customerRepository = customerRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    public List<VendorBillResponse> search(String keyword, VendorBillStatus status, Long supplierId,
            VendorBillType billType, LocalDate dateFrom, LocalDate dateTo) {
        Specification<VendorBill> spec = Specification.allOf(
                VendorBillSpecifications.keyword(keyword),
                VendorBillSpecifications.statusEquals(status),
                VendorBillSpecifications.supplierEquals(supplierId),
                VendorBillSpecifications.typeEquals(billType),
                VendorBillSpecifications.dateFrom(dateFrom),
                VendorBillSpecifications.dateTo(dateTo));
        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "issueDate")).stream()
                .map(VendorBillResponse::from).toList();
    }

    public VendorBillResponse findById(Long id) {
        return VendorBillResponse.from(getOrThrow(id));
    }

    @Transactional
    public VendorBillResponse create(VendorBillRequest req) {
        BigDecimal supply = req.supplyAmount();
        VendorBill b = VendorBill.create(generateCode(), resolveSupplier(req.supplierId()),
                resolvePurchaseOrder(req.purchaseOrderId()), req.billType(), req.issueDate(), supply,
                autoTax(supply, req.taxAmount()), req.status(), req.note());
        return VendorBillResponse.from(repository.save(b));
    }

    @Transactional
    public VendorBillResponse update(Long id, VendorBillRequest req) {
        VendorBill b = getOrThrow(id);
        BigDecimal supply = req.supplyAmount();
        b.update(resolveSupplier(req.supplierId()), resolvePurchaseOrder(req.purchaseOrderId()),
                req.billType(), req.issueDate(), supply, autoTax(supply, req.taxAmount()),
                req.status(), req.note());
        return VendorBillResponse.from(b);
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
        String prefix = "VB-" + Year.now().getValue() + "-";
        long seq = repository.count() + 1;
        String code = prefix + String.format("%04d", seq);
        while (repository.existsByCode(code)) {
            seq++;
            code = prefix + String.format("%04d", seq);
        }
        return code;
    }

    private Customer resolveSupplier(Long supplierId) {
        return customerRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("매입처를 찾을 수 없습니다. id=" + supplierId));
    }

    private PurchaseOrder resolvePurchaseOrder(Long purchaseOrderId) {
        if (purchaseOrderId == null) return null;
        return purchaseOrderRepository.findById(purchaseOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("발주를 찾을 수 없습니다. id=" + purchaseOrderId));
    }

    private VendorBill getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("매입세금계산서를 찾을 수 없습니다. id=" + id));
    }
}
