package cinepark.order;

import cinepark.checkout.dto.CheckoutConfirmResponse;
import cinepark.common.ApiResponse;
import cinepark.config.SecurityUtils;
import cinepark.order.dto.MyOrderSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/my/orders")
@RequiredArgsConstructor
public class MyShopOrderController {

    private final MyShopOrderService myShopOrderService;

    @GetMapping
    public ApiResponse<Page<MyOrderSummaryResponse>> list(
            @PageableDefault(size = 20, sort = "paidAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(myShopOrderService.listForUser(SecurityUtils.requireUserId(), pageable));
    }

    @GetMapping("/{shopOrderId}")
    public ApiResponse<CheckoutConfirmResponse> detail(@PathVariable long shopOrderId) {
        return ApiResponse.success(
                myShopOrderService.detailForBuyer(SecurityUtils.requireUserId(), shopOrderId));
    }
}
