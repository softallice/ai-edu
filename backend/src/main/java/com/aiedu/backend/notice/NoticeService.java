package com.aiedu.backend.notice;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.notice.dto.NoticeRequest;
import com.aiedu.backend.notice.dto.NoticeResponse;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 공지 비즈니스 로직. */
@Service
@Transactional(readOnly = true)
public class NoticeService {

    private final NoticeRepository repository;

    public NoticeService(NoticeRepository repository) {
        this.repository = repository;
    }

    /** 키워드·카테고리·기간으로 검색. 상단고정 내림차순 → 게시일 내림차순 정렬. */
    public List<NoticeResponse> search(String keyword, NoticeCategory category,
            LocalDate dateFrom, LocalDate dateTo) {
        Specification<Notice> spec = Specification.allOf(
                NoticeSpecifications.keyword(keyword),
                NoticeSpecifications.categoryEquals(category),
                NoticeSpecifications.dateFrom(dateFrom),
                NoticeSpecifications.dateTo(dateTo));
        Sort sort = Sort.by(Sort.Direction.DESC, "pinned")
                .and(Sort.by(Sort.Direction.DESC, "postedDate"));
        return repository.findAll(spec, sort).stream()
                .map(NoticeResponse::from).toList();
    }

    public NoticeResponse findById(Long id) {
        return NoticeResponse.from(getOrThrow(id));
    }

    @Transactional
    public NoticeResponse create(NoticeRequest req) {
        Notice n = Notice.create(generateCode(), req.title(), req.content(),
                req.author(), req.category(), req.postedDate(), req.pinned());
        return NoticeResponse.from(repository.save(n));
    }

    @Transactional
    public NoticeResponse update(Long id, NoticeRequest req) {
        Notice n = getOrThrow(id);
        n.update(req.title(), req.content(), req.author(),
                req.category(), req.postedDate(), req.pinned());
        return NoticeResponse.from(n);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private String generateCode() {
        String prefix = "NT-" + Year.now().getValue() + "-";
        long seq = repository.count() + 1;
        String code = prefix + String.format("%04d", seq);
        while (repository.existsByCode(code)) {
            seq++;
            code = prefix + String.format("%04d", seq);
        }
        return code;
    }

    private Notice getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("공지를 찾을 수 없습니다. id=" + id));
    }
}
