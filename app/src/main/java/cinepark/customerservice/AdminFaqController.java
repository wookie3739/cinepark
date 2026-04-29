package cinepark.customerservice;

import cinepark.customerservice.dto.FaqItemResponse;
import cinepark.customerservice.dto.FaqSaveRequest;
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
@RequestMapping("/api/admin/faqs")
@RequiredArgsConstructor
public class AdminFaqController {

    private final FaqService faqService;

    @PostMapping
    public ApiResponse<FaqItemResponse> create(@Valid @RequestBody FaqSaveRequest req) {
        return ApiResponse.success(faqService.create(req), "등록되었습니다.");
    }

    @PutMapping("/{id}")
    public ApiResponse<FaqItemResponse> update(@PathVariable Long id, @Valid @RequestBody FaqSaveRequest req) {
        return ApiResponse.success(faqService.update(id, req), "수정되었습니다.");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        faqService.delete(id);
        return ApiResponse.success(null, "삭제되었습니다.");
    }
}
