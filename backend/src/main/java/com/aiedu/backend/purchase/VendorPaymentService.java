package com.aiedu.backend.purchase;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.customer.Customer;
import com.aiedu.backend.customer.CustomerRepository;
import com.aiedu.backend.purchase.dto.VendorPaymentRequest;
import com.aiedu.backend.purchase.dto.VendorPaymentResponse;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class VendorPaymentService {

    private final VendorPaymentRepository repository;
    private final CustomerRepository customerRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public VendorPaymentService(VendorPaymentRepository repository, CustomerRepository customerRepository,
            PurchaseOrderRepository purchaseOrderRepository) {
        this.repository = repository;
        this.customerRepository = customerRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    /** 대금지급 목록을 검색합니다. */
    public List<VendorPaymentResponse> search(String keyword, VendorPaymentStatus status, Long supplierId,
            LocalDate dateFrom, LocalDate dateTo) {
        Specification<VendorPayment> spec = Specification.allOf(
                VendorPaymentSpecifications.keyword(keyword),
                VendorPaymentSpecifications.statusEquals(status),
                VendorPaymentSpecifications.supplierEquals(supplierId),
                VendorPaymentSpecifications.dateFrom(dateFrom),
                VendorPaymentSpecifications.dateTo(dateTo));
        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "paymentDate")).stream()
                .map(VendorPaymentResponse::from).toList();
    }

    /** 대금지급 단건을 조회합니다. */
    public VendorPaymentResponse findById(Long id) {
        return VendorPaymentResponse.from(getOrThrow(id));
    }

    /** 대금지급을 생성합니다. */
    @Transactional
    public VendorPaymentResponse create(VendorPaymentRequest req) {
        VendorPayment payment = VendorPayment.create(
                generateCode(),
                resolveSupplier(req.supplierId()),
                resolvePurchaseOrder(req.purchaseOrderId()),
                req.paymentDate(),
                req.amount(),
                req.method(),
                req.status(),
                req.note());
        return VendorPaymentResponse.from(repository.save(payment));
    }

    /** 대금지급을 수정합니다. */
    @Transactional
    public VendorPaymentResponse update(Long id, VendorPaymentRequest req) {
        VendorPayment payment = getOrThrow(id);
        payment.update(
                resolveSupplier(req.supplierId()),
                resolvePurchaseOrder(req.purchaseOrderId()),
                req.paymentDate(),
                req.amount(),
                req.method(),
                req.status(),
                req.note());
        return VendorPaymentResponse.from(payment);
    }

    /** 대금지급을 삭제합니다. */
    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private String generateCode() {
        String prefix = "VP-" + Year.now().getValue() + "-";
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
                .orElseThrow(() -> new ResourceNotFoundException("지급대상 거래처를 찾을 수 없습니다. id=" + supplierId));
    }

    private PurchaseOrder resolvePurchaseOrder(Long purchaseOrderId) {
        if (purchaseOrderId == null) return null;
        return purchaseOrderRepository.findById(purchaseOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("발주를 찾을 수 없습니다. id=" + purchaseOrderId));
    }

    private VendorPayment getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("구매대금지급을 찾을 수 없습니다. id=" + id));
    }
}
