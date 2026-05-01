package cinepark.order;

import cinepark.common.ApiResponse;
import cinepark.order.dto.AdminOrderDetailResponse;
import cinepark.order.dto.AdminOrderRowResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminShopOrderController {

    private final AdminShopOrderService adminShopOrderService;

    @GetMapping
    public ApiResponse<Page<AdminOrderRowResponse>> list(
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20, sort = "paidAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(adminShopOrderService.list(q, pageable));
    }

    @GetMapping("/{shopOrderId}")
    public ApiResponse<AdminOrderDetailResponse> detail(@PathVariable long shopOrderId) {
        return ApiResponse.success(adminShopOrderService.detail(shopOrderId));
    }
}
