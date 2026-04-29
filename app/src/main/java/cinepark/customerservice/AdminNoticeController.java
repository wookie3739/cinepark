package cinepark.customerservice;

import cinepark.customerservice.dto.NoticeDetailResponse;
import cinepark.customerservice.dto.NoticeSaveRequest;
import cinepark.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/notices")
@RequiredArgsConstructor
public class AdminNoticeController {

    private final NoticeService noticeService;

    @PostMapping
    public ApiResponse<NoticeDetailResponse> create(@Valid @RequestBody NoticeSaveRequest req) {
        return ApiResponse.success(noticeService.create(req), "등록되었습니다.");
    }

    @PutMapping("/{id}")
    public ApiResponse<NoticeDetailResponse> update(
            @PathVariable Long id, @Valid @RequestBody NoticeSaveRequest req) {
        return ApiResponse.success(noticeService.update(id, req), "수정되었습니다.");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        noticeService.delete(id);
        return ApiResponse.success(null, "삭제되었습니다.");
    }
}
