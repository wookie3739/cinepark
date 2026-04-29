package cinepark.customerservice;

import cinepark.customerservice.dto.InquiryAdminDetailResponse;
import cinepark.customerservice.dto.InquiryAdminRowResponse;
import cinepark.customerservice.dto.InquiryAnswerRequest;
import cinepark.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/inquiries")
@RequiredArgsConstructor
public class AdminInquiryController {

    private final InquiryService inquiryService;

    /** 관리자: 전체 목록 (조회) */
    @GetMapping
    public ApiResponse<Page<InquiryAdminRowResponse>> list(Pageable pageable) {
        return ApiResponse.success(inquiryService.adminList(pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<InquiryAdminDetailResponse> get(@PathVariable Long id) {
        return ApiResponse.success(inquiryService.adminGet(id));
    }

    @PatchMapping("/{id}/answer")
    public ApiResponse<InquiryAdminDetailResponse> answer(
            @PathVariable Long id, @Valid @RequestBody InquiryAnswerRequest req) {
        return ApiResponse.success(inquiryService.adminAnswer(id, req), "답변이 저장되었습니다.");
    }
}
