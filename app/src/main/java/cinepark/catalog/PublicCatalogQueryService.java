package cinepark.catalog;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import cinepark.catalog.dto.CouponProductDetailResponse;
import cinepark.catalog.dto.CouponProductSummaryResponse;
import cinepark.catalog.dto.CouponProductUsageLinkResponse;
import cinepark.catalog.storage.CatalogImageDelivery;
import cinepark.common.BusinessException;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicCatalogQueryService {

    private final CouponCategoryRepository categoryRepository;
    private final CouponProductRepository productRepository;
    private final CouponCodeRepository codeRepository;
    private final CatalogImageDelivery imageDelivery;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<cinepark.catalog.dto.CouponCategoryResponse> listCategories() {
        return categoryRepository.findAllActiveOrderBySort().stream()
                .map(
                        c ->
                                cinepark.catalog.dto.CouponCategoryResponse.builder()
                                        .id(c.getId())
                                        .code(c.getCode())
                                        .label(c.getLabel())
                                        .sortOrder(c.getSortOrder())
                                        .active(c.isActive())
                                        .build())
                .toList();
    }

    public Page<CouponProductSummaryResponse> listProducts(String categoryCodeOrNull, Pageable pageable) {
        Page<CouponProduct> page;
        if (categoryCodeOrNull != null && !categoryCodeOrNull.isBlank()) {
            page =
                    productRepository.findSellablePageByCategory(
                            CouponShelfStatus.ON_SALE,
                            CouponCodeStatus.AVAILABLE,
                            categoryCodeOrNull.trim(),
                            pageable);
        } else {
            page =
                    productRepository.findSellablePage(
                            CouponShelfStatus.ON_SALE, CouponCodeStatus.AVAILABLE, pageable);
        }
        return page.map(this::toSummary);
    }

    public CouponProductDetailResponse getByProductCode(String productCode) {
        CouponProduct p =
                productRepository
                        .findByProductCode(productCode.trim())
                        .orElseThrow(() -> BusinessException.notFound("상품을 찾을 수 없습니다."));
        validatePublicViewable(p);
        return toDetail(p);
    }

    public List<CouponProductDetailResponse> batchByProductCodes(List<String> codes) {
        if (codes == null || codes.isEmpty()) {
            return List.of();
        }
        List<CouponProductDetailResponse> out = new ArrayList<>();
        for (String c : codes) {
            if (c == null || c.isBlank()) {
                continue;
            }
            productRepository
                    .findByProductCode(c.trim())
                    .filter(this::hasStock)
                    .ifPresent(p -> out.add(toDetail(p)));
        }
        return out;
    }

    /** 판매 중·재고 있는 상품 전체. usageUrl 은 비어 있으면 null (앱 전용 등). */
    public List<CouponProductUsageLinkResponse> listSellableProductsWithUsageLink() {
        List<CouponProduct> list =
                productRepository.findSellableWithStockOrderedByName(
                        CouponShelfStatus.ON_SALE, CouponCodeStatus.AVAILABLE);
        return list.stream()
                .map(
                        p ->
                                CouponProductUsageLinkResponse.builder()
                                        .productCode(p.getProductCode())
                                        .name(p.getName())
                                        .brandLabel(p.getBrandLabel())
                                        .usageUrl(normalizeUsageUrl(p.getUsageUrl()))
                                        .build())
                .toList();
    }

    /** 공백 전용 문자열 등은 무시 */
    private static String normalizeUsageUrl(String raw) {
        if (raw == null) {
            return null;
        }
        String t = raw.trim();
        return t.isEmpty() ? null : t;
    }

    private void validatePublicViewable(CouponProduct p) {
        if (p.getShelfStatus() != CouponShelfStatus.ON_SALE) {
            throw BusinessException.notFound("상품을 찾을 수 없습니다.");
        }
        if (!hasStock(p)) {
            throw BusinessException.notFound("상품을 찾을 수 없습니다.");
        }
    }

    private boolean hasStock(CouponProduct p) {
        return codeRepository.countByCouponProduct_IdAndStatus(p.getId(), CouponCodeStatus.AVAILABLE) > 0;
    }

    private CouponProductSummaryResponse toSummary(CouponProduct p) {
        long stock =
                codeRepository.countByCouponProduct_IdAndStatus(p.getId(), CouponCodeStatus.AVAILABLE);
        return CouponProductSummaryResponse.builder()
                .productCode(p.getProductCode())
                .categoryCode(p.getCategory().getCode())
                .name(p.getName())
                .brandLabel(p.getBrandLabel())
                .unitPrice(p.getUnitPrice())
                .originPrice(p.getOriginPrice())
                .mainImageUrl(imageDelivery.publicUrlForObjectKey(p.getMainImageKey()).orElse(null))
                .availableStock(stock)
                .usageUrl(normalizeUsageUrl(p.getUsageUrl()))
                .build();
    }

    private CouponProductDetailResponse toDetail(CouponProduct p) {
        long stock =
                codeRepository.countByCouponProduct_IdAndStatus(p.getId(), CouponCodeStatus.AVAILABLE);
        CouponCategory cat = p.getCategory();
        return CouponProductDetailResponse.builder()
                .productCode(p.getProductCode())
                .categoryCode(cat.getCode())
                .categoryLabel(cat.getLabel())
                .name(p.getName())
                .brandLabel(p.getBrandLabel())
                .unitPrice(p.getUnitPrice())
                .originPrice(p.getOriginPrice())
                .shortDesc(null)
                .bullets(parseBullets(p.getBullets()))
                .noticeHtml(p.getNoticeHtml())
                .mainImageUrl(imageDelivery.publicUrlForObjectKey(p.getMainImageKey()).orElse(null))
                .detailImageUrls(imageDelivery.publicUrlsForJsonArray(p.getDetailImageKeys()))
                .availableStock(stock)
                .categoryId(null)
                .mainImageKey(null)
                .detailImageKeys(null)
                .usageUrl(normalizeUsageUrl(p.getUsageUrl()))
                .build();
    }

    public CouponProductDetailResponse toDetailForAdmin(CouponProduct p, long availableStockOverride) {
        CouponCategory cat = p.getCategory();
        return CouponProductDetailResponse.builder()
                .productCode(p.getProductCode())
                .categoryCode(cat.getCode())
                .categoryLabel(cat.getLabel())
                .name(p.getName())
                .brandLabel(p.getBrandLabel())
                .unitPrice(p.getUnitPrice())
                .originPrice(p.getOriginPrice())
                .shortDesc(p.getShortDesc())
                .bullets(parseBullets(p.getBullets()))
                .noticeHtml(p.getNoticeHtml())
                .mainImageUrl(imageDelivery.publicUrlForObjectKey(p.getMainImageKey()).orElse(null))
                .detailImageUrls(imageDelivery.publicUrlsForJsonArray(p.getDetailImageKeys()))
                .availableStock(availableStockOverride)
                .categoryId(cat.getId())
                .mainImageKey(p.getMainImageKey())
                .detailImageKeys(p.getDetailImageKeys())
                .usageUrl(normalizeUsageUrl(p.getUsageUrl()))
                .build();
    }

    private List<String> parseBullets(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return List.of();
        }
    }
}
