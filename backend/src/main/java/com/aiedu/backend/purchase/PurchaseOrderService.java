package com.aiedu.backend.purchase;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.customer.Customer;
import com.aiedu.backend.customer.CustomerRepository;
import com.aiedu.backend.pm.Project;
import com.aiedu.backend.pm.ProjectRepository;
import com.aiedu.backend.purchase.dto.PurchaseOrderRequest;
import com.aiedu.backend.purchase.dto.PurchaseOrderResponse;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PurchaseOrderService {

    private final PurchaseOrderRepository repository;
    private final CustomerRepository customerRepository;
    private final ProjectRepository projectRepository;

    public PurchaseOrderService(PurchaseOrderRepository repository, CustomerRepository customerRepository,
            ProjectRepository projectRepository) {
        this.repository = repository;
        this.customerRepository = customerRepository;
        this.projectRepository = projectRepository;
    }

    /** 발주 목록을 검색합니다. */
    public List<PurchaseOrderResponse> search(String keyword, PurchaseOrderStatus status, Long supplierId,
            LocalDate dateFrom, LocalDate dateTo) {
        Specification<PurchaseOrder> spec = Specification.allOf(
                PurchaseOrderSpecifications.keyword(keyword),
                PurchaseOrderSpecifications.statusEquals(status),
                PurchaseOrderSpecifications.supplierEquals(supplierId),
                PurchaseOrderSpecifications.dateFrom(dateFrom),
                PurchaseOrderSpecifications.dateTo(dateTo));
        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "orderDate")).stream()
                .map(PurchaseOrderResponse::from).toList();
    }

    /** 발주 단건을 조회합니다. */
    public PurchaseOrderResponse findById(Long id) {
        return PurchaseOrderResponse.from(getOrThrow(id));
    }

    /** 발주를 생성합니다. */
    @Transactional
    public PurchaseOrderResponse create(PurchaseOrderRequest req) {
        PurchaseOrder order = PurchaseOrder.create(
                generateCode(),
                resolveSupplier(req.supplierId()),
                resolveProject(req.projectId()),
                req.orderDate(),
                req.deliveryDate(),
                req.amount(),
                req.status(),
                req.note());
        return PurchaseOrderResponse.from(repository.save(order));
    }

    /** 발주를 수정합니다. */
    @Transactional
    public PurchaseOrderResponse update(Long id, PurchaseOrderRequest req) {
        PurchaseOrder order = getOrThrow(id);
        order.update(
                resolveSupplier(req.supplierId()),
                resolveProject(req.projectId()),
                req.orderDate(),
                req.deliveryDate(),
                req.amount(),
                req.status(),
                req.note());
        return PurchaseOrderResponse.from(order);
    }

    /** 발주를 삭제합니다. */
    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private String generateCode() {
        String prefix = "PO-" + Year.now().getValue() + "-";
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
                .orElseThrow(() -> new ResourceNotFoundException("공급처를 찾을 수 없습니다. id=" + supplierId));
    }

    private Project resolveProject(Long projectId) {
        if (projectId == null) return null;
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다. id=" + projectId));
    }

    private PurchaseOrder getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("구매발주를 찾을 수 없습니다. id=" + id));
    }
}
