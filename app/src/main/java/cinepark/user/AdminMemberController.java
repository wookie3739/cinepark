package cinepark.user;

import cinepark.common.ApiResponse;
import cinepark.user.dto.AdminMemberDetailResponse;
import cinepark.user.dto.AdminMemberRowResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/members")
@RequiredArgsConstructor
public class AdminMemberController {

    private final AdminMemberService adminMemberService;

    @GetMapping
    public ApiResponse<Page<AdminMemberRowResponse>> list(@RequestParam(required = false) String q, Pageable pageable) {
        return ApiResponse.success(adminMemberService.list(q, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<AdminMemberDetailResponse> detail(@PathVariable Long id) {
        return ApiResponse.success(adminMemberService.detail(id));
    }
}
