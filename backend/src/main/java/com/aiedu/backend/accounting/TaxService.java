package com.aiedu.backend.accounting;

import com.aiedu.backend.common.ResourceNotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 세금·세금그룹 서비스. */
@Service
@Transactional(readOnly = true)
public class TaxService {

    private final TaxRepository taxRepository;
    private final TaxGroupRepository taxGroupRepository;

    public TaxService(TaxRepository taxRepository, TaxGroupRepository taxGroupRepository) {
        this.taxRepository = taxRepository;
        this.taxGroupRepository = taxGroupRepository;
    }

    /** 세금그룹 목록. */
    public List<TaxGroup> listTaxGroups() {
        return taxGroupRepository.findAll();
    }

    /** 세금그룹 등록. */
    @Transactional
    public TaxGroup createTaxGroup(String code, String name) {
        if (taxGroupRepository.existsByCode(code)) {
            throw new IllegalArgumentException("이미 존재하는 세금그룹 코드입니다: " + code);
        }
        return taxGroupRepository.save(TaxGroup.create(code, name));
    }

    /** 세금그룹 수정. */
    @Transactional
    public TaxGroup updateTaxGroup(Long id, String name, boolean active) {
        TaxGroup g = taxGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("세금그룹을 찾을 수 없습니다. id=" + id));
        g.update(name, active);
        return g;
    }

    /** 세금 목록. */
    public List<Tax> listTaxes() {
        return taxRepository.findAll();
    }

    /** 세금 등록. */
    @Transactional
    public Tax createTax(String code, String name, TaxAmountType amountType, double amount,
            TaxUse typeTaxUse, Long taxGroupId) {
        if (taxRepository.existsByCode(code)) {
            throw new IllegalArgumentException("이미 존재하는 세금 코드입니다: " + code);
        }
        TaxGroup group = taxGroupId == null ? null
                : taxGroupRepository.findById(taxGroupId)
                        .orElseThrow(() -> new ResourceNotFoundException("세금그룹을 찾을 수 없습니다. id=" + taxGroupId));
        return taxRepository.save(Tax.create(code, name, amountType, amount, typeTaxUse, group));
    }

    /** 세금 수정. */
    @Transactional
    public Tax updateTax(Long id, String name, TaxAmountType amountType, double amount, boolean active) {
        Tax t = taxRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("세금을 찾을 수 없습니다. id=" + id));
        t.update(name, amountType, amount, active);
        return t;
    }
}
