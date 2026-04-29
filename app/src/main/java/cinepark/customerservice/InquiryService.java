package cinepark.customerservice;

import cinepark.customerservice.dto.InquiryAdminDetailResponse;
import cinepark.customerservice.dto.InquiryAdminRowResponse;
import cinepark.customerservice.dto.InquiryAnswerRequest;
import cinepark.customerservice.dto.InquiryCreateRequest;
import cinepark.customerservice.dto.InquiryMineResponse;
import cinepark.user.User;
import cinepark.user.UserRepository;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final CustomerInquiryRepository inquiryRepository;
    private final UserRepository userRepository;

    @Transactional
    public InquiryMineResponse create(Long userId, InquiryCreateRequest req) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        CustomerInquiry in =
                CustomerInquiry.builder()
                        .user(user)
                        .title(req.getTitle().trim())
                        .content(req.getContent())
                        .status(InquiryStatus.OPEN)
                        .build();
        in = inquiryRepository.save(in);
        return toMineResponse(in);
    }

    public Page<InquiryMineResponse> listMine(Long userId, Pageable pageable) {
        return inquiryRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable).map(this::toMineResponse);
    }

    @Transactional(readOnly = true)
    public InquiryMineResponse getMine(Long userId, Long inquiryId) {
        CustomerInquiry in =
                inquiryRepository.findById(inquiryId).orElseThrow(() -> new IllegalArgumentException("문의를 찾을 수 없습니다."));
        if (!in.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("문의를 찾을 수 없습니다.");
        }
        return toMineResponse(in);
    }

    @Transactional(readOnly = true)
    public Page<InquiryAdminRowResponse> adminList(Pageable pageable) {
        return inquiryRepository
                .findAllByOrderByCreatedAtDesc(pageable)
                .map(
                        in ->
                                InquiryAdminRowResponse.builder()
                                        .id(in.getId())
                                        .writerEmail(in.getUser().getEmail())
                                        .title(in.getTitle())
                                        .status(in.getStatus())
                                        .createdAt(in.getCreatedAt())
                                        .build());
    }

    @Transactional(readOnly = true)
    public InquiryAdminDetailResponse adminGet(Long id) {
        CustomerInquiry in =
                inquiryRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("문의를 찾을 수 없습니다."));
        return toAdminDetail(in);
    }

    @Transactional
    public InquiryAdminDetailResponse adminAnswer(Long id, InquiryAnswerRequest req) {
        CustomerInquiry in =
                inquiryRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("문의를 찾을 수 없습니다."));
        in.setAnswer(req.getAnswer());
        in.setStatus(InquiryStatus.ANSWERED);
        in.setAnsweredAt(Instant.now());
        return toAdminDetail(in);
    }

    private InquiryMineResponse toMineResponse(CustomerInquiry in) {
        return InquiryMineResponse.builder()
                .id(in.getId())
                .title(in.getTitle())
                .content(in.getContent())
                .status(in.getStatus())
                .answer(in.getAnswer())
                .createdAt(in.getCreatedAt())
                .answeredAt(in.getAnsweredAt())
                .build();
    }

    private InquiryAdminDetailResponse toAdminDetail(CustomerInquiry in) {
        User u = in.getUser();
        return InquiryAdminDetailResponse.builder()
                .id(in.getId())
                .writerEmail(u.getEmail())
                .writerName(u.getName())
                .title(in.getTitle())
                .content(in.getContent())
                .status(in.getStatus())
                .answer(in.getAnswer())
                .createdAt(in.getCreatedAt())
                .answeredAt(in.getAnsweredAt())
                .build();
    }
}
