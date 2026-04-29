package cinepark.customerservice;

import cinepark.customerservice.dto.FaqItemResponse;
import cinepark.customerservice.dto.FaqSaveRequest;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FaqService {

    private final FaqRepository faqRepository;

    public List<FaqItemResponse> list() {
        return faqRepository.findAllByOrderBySortOrderAscCreatedAtDesc().stream()
                .map(FaqItemResponse::from)
                .collect(Collectors.toList());
    }

    public FaqItemResponse get(Long id) {
        Faq f = faqRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("FAQ를 찾을 수 없습니다."));
        return FaqItemResponse.from(f);
    }

    @Transactional
    public FaqItemResponse create(FaqSaveRequest req) {
        Faq f =
                Faq.builder()
                        .question(req.getQuestion().trim())
                        .answer(req.getAnswer())
                        .sortOrder(req.getSortOrder())
                        .build();
        f = faqRepository.save(f);
        return FaqItemResponse.from(f);
    }

    @Transactional
    public FaqItemResponse update(Long id, FaqSaveRequest req) {
        Faq f = faqRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("FAQ를 찾을 수 없습니다."));
        f.setQuestion(req.getQuestion().trim());
        f.setAnswer(req.getAnswer());
        f.setSortOrder(req.getSortOrder());
        return FaqItemResponse.from(f);
    }

    @Transactional
    public void delete(Long id) {
        if (!faqRepository.existsById(id)) {
            throw new IllegalArgumentException("FAQ를 찾을 수 없습니다.");
        }
        faqRepository.deleteById(id);
    }
}
