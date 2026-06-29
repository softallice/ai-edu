package com.aiedu.backend.commoncode;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.commoncode.dto.CommonCodeRequest;
import com.aiedu.backend.commoncode.dto.CommonCodeResponse;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 공통코드 비즈니스 로직. */
@Service
@Transactional(readOnly = true)
public class CommonCodeService {

    private final CommonCodeRepository repository;

    public CommonCodeService(CommonCodeRepository repository) {
        this.repository = repository;
    }

    /** 키워드·코드그룹·사용여부로 검색. 코드그룹 오름차순 → 정렬순서 오름차순. */
    public List<CommonCodeResponse> search(String keyword, String codeGroup, Boolean useYn) {
        Specification<CommonCode> spec = Specification.allOf(
                CommonCodeSpecifications.keyword(keyword),
                CommonCodeSpecifications.codeGroupEquals(codeGroup),
                CommonCodeSpecifications.useYnEquals(useYn));
        Sort sort = Sort.by(Sort.Direction.ASC, "codeGroup")
                .and(Sort.by(Sort.Direction.ASC, "sortOrder"));
        return repository.findAll(spec, sort).stream()
                .map(CommonCodeResponse::from).toList();
    }

    /** ID로 단건 조회. 없으면 ResourceNotFoundException. */
    public CommonCodeResponse findById(Long id) {
        return CommonCodeResponse.from(getOrThrow(id));
    }

    /** 공통코드 등록. codeGroup+code 중복 시 IllegalArgumentException. */
    @Transactional
    public CommonCodeResponse create(CommonCodeRequest req) {
        if (repository.existsByCodeGroupAndCode(req.codeGroup(), req.code())) {
            throw new IllegalArgumentException(
                    "이미 존재하는 코드입니다: " + req.codeGroup() + "/" + req.code());
        }
        CommonCode entity = CommonCode.create(
                req.codeGroup(), req.code(), req.name(),
                req.sortOrder(), req.useYn(), req.description());
        return CommonCodeResponse.from(repository.save(entity));
    }

    /** 공통코드 수정. codeGroup·code 는 불변이므로 요청에 있어도 무시. */
    @Transactional
    public CommonCodeResponse update(Long id, CommonCodeRequest req) {
        CommonCode entity = getOrThrow(id);
        entity.update(req.name(), req.sortOrder(), req.useYn(), req.description());
        return CommonCodeResponse.from(entity);
    }

    /** 공통코드 삭제. */
    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private CommonCode getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "공통코드를 찾을 수 없습니다. id=" + id));
    }
}
