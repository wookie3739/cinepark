package cinepark.user;

import cinepark.common.ApiResponse;
import cinepark.config.SecurityUtils;
import cinepark.user.dto.MyProfileResponse;
import cinepark.user.dto.MyProfileUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MyProfileController {

    private final MyProfileService myProfileService;

    @GetMapping
    public ApiResponse<MyProfileResponse> get() {
        return ApiResponse.success(myProfileService.get(SecurityUtils.requireUserId()));
    }

    @PatchMapping
    public ApiResponse<MyProfileResponse> update(@Valid @RequestBody MyProfileUpdateRequest req) {
        Long userId = SecurityUtils.requireUserId();
        return ApiResponse.success(myProfileService.update(userId, req), "내 정보가 저장되었습니다.");
    }
}
