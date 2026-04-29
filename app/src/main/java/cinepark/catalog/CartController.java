package cinepark.catalog;

import cinepark.catalog.dto.CartItemUpsertRequest;
import cinepark.catalog.dto.CartViewResponse;
import cinepark.common.ApiResponse;
import cinepark.config.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ApiResponse<CartViewResponse> get() {
        return ApiResponse.success(cartService.getCart(SecurityUtils.requireUserId()));
    }

    @PutMapping("/items")
    public ApiResponse<CartViewResponse> upsert(@Valid @RequestBody CartItemUpsertRequest req) {
        return ApiResponse.success(cartService.upsertLine(SecurityUtils.requireUserId(), req));
    }

    @DeleteMapping("/items/{productCode}")
    public ApiResponse<CartViewResponse> remove(@PathVariable String productCode) {
        return ApiResponse.success(cartService.removeLine(SecurityUtils.requireUserId(), productCode));
    }

    @DeleteMapping
    public ApiResponse<Void> clear() {
        cartService.clearCart(SecurityUtils.requireUserId());
        return ApiResponse.success(null, "비웠습니다.");
    }
}
