package cinepark.customerservice;

import cinepark.customerservice.dto.FaqItemResponse;
import cinepark.common.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/faqs")
@RequiredArgsConstructor
public class PublicFaqController {

    private final FaqService faqService;

    @GetMapping
    public ApiResponse<List<FaqItemResponse>> list() {
        return ApiResponse.success(faqService.list());
    }

    @GetMapping("/{id}")
    public ApiResponse<FaqItemResponse> get(@PathVariable Long id) {
        return ApiResponse.success(faqService.get(id));
    }
}
