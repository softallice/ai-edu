package com.aiedu.backend.hr;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.hr.dto.DepartmentRequest;
import com.aiedu.backend.hr.dto.DepartmentResponse;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DepartmentService {

    private final DepartmentRepository repository;

    public DepartmentService(DepartmentRepository repository) {
        this.repository = repository;
    }

    public List<DepartmentResponse> findAll() {
        List<Department> all = repository.findAll(Sort.by("sequence").ascending().and(Sort.by("name")));
        Map<Long, String> names = all.stream().collect(Collectors.toMap(Department::getId, Department::getName));
        return all.stream()
                .map(d -> DepartmentResponse.from(d, d.getParentId() == null ? null : names.get(d.getParentId())))
                .toList();
    }

    public DepartmentResponse findById(Long id) {
        Department d = getOrThrow(id);
        return DepartmentResponse.from(d, parentName(d.getParentId()));
    }

    @Transactional
    public DepartmentResponse create(DepartmentRequest req) {
        if (repository.existsByCode(req.code())) {
            throw new IllegalArgumentException("이미 존재하는 부서코드입니다: " + req.code());
        }
        Department d = Department.create(req.code(), req.name(), req.sequenceOrDefault(), req.activeFlag(), req.parentId());
        return DepartmentResponse.from(repository.save(d), parentName(req.parentId()));
    }

    @Transactional
    public DepartmentResponse update(Long id, DepartmentRequest req) {
        Department d = getOrThrow(id);
        if (repository.existsByCodeAndIdNot(req.code(), id)) {
            throw new IllegalArgumentException("이미 존재하는 부서코드입니다: " + req.code());
        }
        d.update(req.code(), req.name(), req.sequenceOrDefault(), req.activeFlag(), req.parentId());
        return DepartmentResponse.from(d, parentName(req.parentId()));
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private String parentName(Long parentId) {
        if (parentId == null) return null;
        return repository.findById(parentId).map(Department::getName).orElse(null);
    }

    private Department getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("부서를 찾을 수 없습니다. id=" + id));
    }

    // 시드/내부용
    public Function<String, Long> codeToIdResolver() {
        Map<String, Long> map = repository.findAll().stream()
                .collect(Collectors.toMap(Department::getCode, Department::getId));
        return map::get;
    }
}
