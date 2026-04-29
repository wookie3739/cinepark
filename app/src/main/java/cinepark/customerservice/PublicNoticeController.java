package cinepark.customerservice;

import cinepark.customerservice.dto.NoticeDetailResponse;
import cinepark.customerservice.dto.NoticeSummaryResponse;
import cinepark.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class PublicNoticeController {

    private final NoticeService noticeService;

    @GetMapping
    public ApiResponse<Page<NoticeSummaryResponse>> list(Pageable pageable) {
        return ApiResponse.success(noticeService.list(pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<NoticeDetailResponse> get(@PathVariable Long id) {
        return ApiResponse.success(noticeService.get(id));
    }
}
