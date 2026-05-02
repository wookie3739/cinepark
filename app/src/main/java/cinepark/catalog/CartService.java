package cinepark.catalog;

import cinepark.catalog.dto.CartItemUpsertRequest;
import cinepark.catalog.dto.CartLineResponse;
import cinepark.catalog.dto.CartViewResponse;
import cinepark.catalog.storage.CatalogImageDelivery;
import cinepark.common.BusinessException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartLineRepository cartLineRepository;
    private final CouponProductRepository productRepository;
    private final CouponCodeRepository codeRepository;
    private final CatalogImageDelivery imageDelivery;

    @Transactional(readOnly = true)
    public CartViewResponse getCart(Long userId) {
        List<CartLine> lines = cartLineRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        return buildView(lines);
    }

    @Transactional
    public CartViewResponse upsertLine(Long userId, CartItemUpsertRequest req) {
        CouponProduct product =
                productRepository
                        .findByProductCode(req.getProductCode().trim())
                        .orElseThrow(() -> BusinessException.notFound("상품을 찾을 수 없습니다."));
        if (product.getShelfStatus() != CouponShelfStatus.ON_SALE) {
            throw BusinessException.badRequest("판매 중인 상품이 아닙니다.");
        }
        int qty = req.getQuantity();
        if (qty <= 0) {
            cartLineRepository.deleteByUserIdAndCouponProduct_Id(userId, product.getId());
            return buildView(cartLineRepository.findByUserIdOrderByUpdatedAtDesc(userId));
        }
        if (qty > 99) {
            qty = 99;
        }
        long available =
                codeRepository.countByCouponProduct_IdAndStatus(product.getId(), CouponCodeStatus.AVAILABLE);
        if (available < qty) {
            throw BusinessException.badRequest("재고가 부족합니다.");
        }
        CartLine line =
                cartLineRepository
                        .findByUserIdAndCouponProduct_Id(userId, product.getId())
                        .orElseGet(
                                () ->
                                        CartLine.builder()
                                                .userId(userId)
                                                .couponProduct(product)
                                                .quantity(0)
                                                .build());
        line.setQuantity(qty);
        line.setCouponProduct(product);
        cartLineRepository.save(line);
        return buildView(cartLineRepository.findByUserIdOrderByUpdatedAtDesc(userId));
    }

    @Transactional
    public CartViewResponse removeLine(Long userId, String productCode) {
        CouponProduct product =
                productRepository
                        .findByProductCode(productCode.trim())
                        .orElseThrow(() -> BusinessException.notFound("상품을 찾을 수 없습니다."));
        cartLineRepository.deleteByUserIdAndCouponProduct_Id(userId, product.getId());
        return buildView(cartLineRepository.findByUserIdOrderByUpdatedAtDesc(userId));
    }

    @Transactional
    public void clearCart(Long userId) {
        cartLineRepository.deleteAllByUserId(userId);
    }

    /**
     * 결제 확정 후 장바구니에서 주문에 포함된 상품 수량만큼만 차감합니다. 바로구매 등으로 장바구니에 없던 품목은 건너뜁니다.
     */
    @Transactional
    public void decrementQuantitiesForOrder(Long userId, Map<String, Integer> productCodeToPurchasedQty) {
        if (productCodeToPurchasedQty == null || productCodeToPurchasedQty.isEmpty()) {
            return;
        }
        for (Map.Entry<String, Integer> e : productCodeToPurchasedQty.entrySet()) {
            if (e.getKey() == null) {
                continue;
            }
            String code = e.getKey().trim();
            if (code.isEmpty()) {
                continue;
            }
            int purchased = e.getValue() == null ? 0 : e.getValue();
            if (purchased < 1) {
                continue;
            }
            Optional<CouponProduct> productOpt = productRepository.findByProductCode(code);
            if (productOpt.isEmpty()) {
                continue;
            }
            CouponProduct product = productOpt.get();
            Optional<CartLine> lineOpt =
                    cartLineRepository.findByUserIdAndCouponProduct_Id(userId, product.getId());
            if (lineOpt.isEmpty()) {
                continue;
            }
            CartLine line = lineOpt.get();
            int next = line.getQuantity() - purchased;
            if (next <= 0) {
                cartLineRepository.deleteByUserIdAndCouponProduct_Id(userId, product.getId());
            } else {
                line.setQuantity(next);
                cartLineRepository.save(line);
            }
        }
    }

    private CartViewResponse buildView(List<CartLine> lines) {
        List<CartLineResponse> dto = new ArrayList<>();
        int total = 0;
        for (CartLine ln : lines) {
            CouponProduct p = ln.getCouponProduct();
            int lineTot = ln.getQuantity() * p.getUnitPrice();
            total += lineTot;
            dto.add(
                    CartLineResponse.builder()
                            .productCode(p.getProductCode())
                            .name(p.getName())
                            .brandLabel(p.getBrandLabel())
                            .unitPrice(p.getUnitPrice())
                            .originPrice(p.getOriginPrice())
                            .quantity(ln.getQuantity())
                            .lineTotal(lineTot)
                            .mainImageUrl(imageDelivery.publicUrlForObjectKey(p.getMainImageKey()).orElse(null))
                            .build());
        }
        return CartViewResponse.builder()
                .lines(dto)
                .totalAmount(total)
                .lineCount(dto.size())
                .build();
    }
}
