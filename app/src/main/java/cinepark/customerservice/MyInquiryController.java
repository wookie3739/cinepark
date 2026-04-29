package cinepark.customerservice;

import cinepark.config.SecurityUtils;
import cinepark.customerservice.dto.InquiryCreateRequest;
import cinepark.customerservice.dto.InquiryMineResponse;
import cinepark.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/my/inquiries")
@RequiredArgsConstructor
public class MyInquiryController {

    private final InquiryService inquiryService;

    @PostMapping
    public ApiResponse<InquiryMineResponse> create(@Valid @RequestBody InquiryCreateRequest req) {
        Long userId = SecurityUtils.requireUserId();
        return ApiResponse.success(inquiryService.create(userId, req), "문의가 등록되었습니다.");
    }

    @GetMapping
    public ApiResponse<Page<InquiryMineResponse>> list(Pageable pageable) {
        Long userId = SecurityUtils.requireUserId();
        return ApiResponse.success(inquiryService.listMine(userId, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<InquiryMineResponse> get(@PathVariable Long id) {
        Long userId = SecurityUtils.requireUserId();
        return ApiResponse.success(inquiryService.getMine(userId, id));
    }
}
