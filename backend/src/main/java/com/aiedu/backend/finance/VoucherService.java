package com.aiedu.backend.finance;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.finance.dto.VoucherRequest;
import com.aiedu.backend.finance.dto.VoucherResponse;
import com.aiedu.backend.pm.Project;
import com.aiedu.backend.pm.ProjectRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 전표 서비스. */
@Service
@Transactional(readOnly = true)
public class VoucherService {

    private final VoucherRepository repository;
    private final ProjectRepository projectRepository;

    public VoucherService(VoucherRepository repository, ProjectRepository projectRepository) {
        this.repository = repository;
        this.projectRepository = projectRepository;
    }

    /** 전표 목록 검색. keyword=code/account, 날짜 범위 지원. */
    public List<VoucherResponse> search(String keyword, LocalDate dateFrom, LocalDate dateTo) {
        Specification<Voucher> spec = Specification.allOf(
                VoucherSpecifications.keyword(keyword),
                VoucherSpecifications.dateFrom(dateFrom),
                VoucherSpecifications.dateTo(dateTo));
        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "voucherDate")).stream()
                .map(VoucherResponse::from).toList();
    }

    /** 전표 단건 조회. */
    public VoucherResponse findById(Long id) {
        return VoucherResponse.from(getOrThrow(id));
    }

    /** 전표 등록. */
    @Transactional
    public VoucherResponse create(VoucherRequest req) {
        Voucher v = Voucher.create(
                generateCode(),
                req.voucherDate(),
                req.account(),
                req.debit() != null ? req.debit() : BigDecimal.ZERO,
                req.credit() != null ? req.credit() : BigDecimal.ZERO,
                req.description(),
                resolveProject(req.projectId()));
        return VoucherResponse.from(repository.save(v));
    }

    /** 전표 수정. */
    @Transactional
    public VoucherResponse update(Long id, VoucherRequest req) {
        Voucher v = getOrThrow(id);
        v.update(
                req.voucherDate(),
                req.account(),
                req.debit() != null ? req.debit() : BigDecimal.ZERO,
                req.credit() != null ? req.credit() : BigDecimal.ZERO,
                req.description(),
                resolveProject(req.projectId()));
        return VoucherResponse.from(v);
    }

    /** 전표 삭제. */
    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private String generateCode() {
        String prefix = "JV-" + Year.now().getValue() + "-";
        long seq = repository.count() + 1;
        String code = prefix + String.format("%04d", seq);
        while (repository.existsByCode(code)) {
            seq++;
            code = prefix + String.format("%04d", seq);
        }
        return code;
    }

    private Project resolveProject(Long projectId) {
        if (projectId == null) return null;
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다. id=" + projectId));
    }

    private Voucher getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("전표를 찾을 수 없습니다. id=" + id));
    }
}
