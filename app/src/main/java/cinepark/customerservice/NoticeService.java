package cinepark.customerservice;

import cinepark.customerservice.dto.NoticeDetailResponse;
import cinepark.customerservice.dto.NoticeSaveRequest;
import cinepark.customerservice.dto.NoticeSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;

    public Page<NoticeSummaryResponse> list(Pageable pageable) {
        return noticeRepository.findAllByOrderByPinnedDescCreatedAtDesc(pageable).map(NoticeSummaryResponse::from);
    }

    public NoticeDetailResponse get(Long id) {
        Notice n = noticeRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다."));
        return NoticeDetailResponse.from(n);
    }

    @Transactional
    public NoticeDetailResponse create(NoticeSaveRequest req) {
        Notice n =
                Notice.builder()
                        .category(trimToNull(req.getCategory()))
                        .title(req.getTitle().trim())
                        .body(req.getBody())
                        .pinned(req.isPinned())
                        .build();
        n = noticeRepository.save(n);
        return NoticeDetailResponse.from(n);
    }

    @Transactional
    public NoticeDetailResponse update(Long id, NoticeSaveRequest req) {
        Notice n = noticeRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다."));
        n.setCategory(trimToNull(req.getCategory()));
        n.setTitle(req.getTitle().trim());
        n.setBody(req.getBody());
        n.setPinned(req.isPinned());
        return NoticeDetailResponse.from(n);
    }

    @Transactional
    public void delete(Long id) {
        if (!noticeRepository.existsById(id)) {
            throw new IllegalArgumentException("공지사항을 찾을 수 없습니다.");
        }
        noticeRepository.deleteById(id);
    }

    private static String trimToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
