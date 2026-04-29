package cinepark.dashboard;

import cinepark.common.ApiResponse;
import cinepark.dashboard.dto.AdminDashboardOverviewResponse;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping
    public ApiResponse<AdminDashboardOverviewResponse> overview(
            @RequestParam(value = "chartFrom", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                    LocalDate chartFrom,
            @RequestParam(value = "chartTo", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                    LocalDate chartTo) {
        return ApiResponse.success(adminDashboardService.overview(chartFrom, chartTo));
    }
}
