package cinepark.catalog;

import cinepark.catalog.dto.AdminCouponProductRowResponse;
import cinepark.catalog.dto.CouponCodeAdminRowResponse;
import cinepark.catalog.dto.CouponCodeBulkAppendRequest;
import cinepark.catalog.dto.CouponCodeBulkRowsRequest;
import cinepark.catalog.dto.CouponProductDetailResponse;
import cinepark.catalog.dto.CouponProductSaveRequest;
import cinepark.common.BusinessException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminCouponProductService {

    private final CouponProductRepository productRepository;
    private final CouponCategoryRepository categoryRepository;
    private final CouponCodeRepository codeRepository;
    private final CartLineRepository cartLineRepository;
    private final PublicCatalogQueryService publicCatalogQueryService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional(readOnly = true)
    public Page<AdminCouponProductRowResponse> list(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::toRow);
    }

    @Transactional(readOnly = true)
    public CouponProductDetailResponse detailForAdmin(Long id) {
        CouponProduct p =
                productRepository
                        .findById(id)
                        .orElseThrow(() -> BusinessException.notFound("상품을 찾을 수 없습니다."));
        long stock = codeRepository.countByCouponProduct_IdAndStatus(p.getId(), CouponCodeStatus.AVAILABLE);
        return publicCatalogQueryService.toDetailForAdmin(p, stock);
    }

    @Transactional(readOnly = true)
    public Page<CouponCodeAdminRowResponse> listCouponCodesForProduct(Long productId, Pageable pageable) {
        if (!productRepository.existsById(productId)) {
            throw BusinessException.notFound("상품을 찾을 수 없습니다.");
        }
        return codeRepository.findByCouponProduct_Id(productId, pageable).map(this::toCouponCodeAdminRow);
    }

    private CouponCodeAdminRowResponse toCouponCodeAdminRow(CouponCode c) {
        return CouponCodeAdminRowResponse.builder()
                .id(c.getId())
                .credential(c.getCredential())
                .status(c.getStatus())
                .issuedToUserId(c.getIssuedToUserId())
                .orderId(c.getOrderId())
                .orderLineId(c.getOrderLineId())
                .issuedAt(c.getIssuedAt())
                .createdAt(c.getCreatedAt())
                .build();
    }

    /** 퍼블릭과 동일 매핑 노출 — Admin에서만 id로 조회 후 사용 */
    private AdminCouponProductRowResponse toRow(CouponProduct p) {
        CouponCategory cat = p.getCategory();
        long stock = codeRepository.countByCouponProduct_IdAndStatus(p.getId(), CouponCodeStatus.AVAILABLE);
        return AdminCouponProductRowResponse.builder()
                .id(p.getId())
                .productCode(p.getProductCode())
                .categoryCode(cat.getCode())
                .categoryLabel(cat.getLabel())
                .name(p.getName())
                .brandLabel(p.getBrandLabel())
                .shelfStatus(p.getShelfStatus())
                .unitPrice(p.getUnitPrice())
                .availableStock(stock)
                .usageLinkRegistered(trimmedOrNull(p.getUsageUrl()) != null)
                .build();
    }

    @Transactional
    public CouponProductDetailResponse create(CouponProductSaveRequest req) {
        CouponCategory cat =
                categoryRepository
                        .findById(req.getCategoryId())
                        .orElseThrow(() -> BusinessException.notFound("카테고리를 찾을 수 없습니다."));
        CouponProduct e =
                CouponProduct.builder()
                        .productCode(uniqueProductCode())
                        .category(cat)
                        .name(req.getName().trim())
                        .brandLabel(req.getBrandLabel().trim())
                        .unitPrice(req.getUnitPrice())
                        .originPrice(req.getOriginPrice())
                        .shortDesc(trimmedOrNull(req.getShortDesc()))
                        .bullets(normalizeBulletsJson(req.getBullets()))
                        .noticeHtml(trimmedOrNull(req.getNoticeHtml()))
                        .mainImageKey(trimmedOrNull(req.getMainImageKey()))
                        .detailImageKeys(normalizeDetailKeysJson(req.getDetailImageKeys()))
                        .shelfStatus(req.getShelfStatus())
                        .usageUrl(trimmedOrNull(req.getUsageUrl()))
                        .build();
        productRepository.save(e);
        long stock = codeRepository.countByCouponProduct_IdAndStatus(e.getId(), CouponCodeStatus.AVAILABLE);
        return publicCatalogQueryService.toDetailForAdmin(e, stock);
    }

    @Transactional
    public CouponProductDetailResponse update(Long id, CouponProductSaveRequest req) {
        CouponProduct p =
                productRepository
                        .findById(id)
                        .orElseThrow(() -> BusinessException.notFound("상품을 찾을 수 없습니다."));
        CouponCategory cat =
                categoryRepository
                        .findById(req.getCategoryId())
                        .orElseThrow(() -> BusinessException.notFound("카테고리를 찾을 수 없습니다."));
        p.setCategory(cat);
        p.setName(req.getName().trim());
        p.setBrandLabel(req.getBrandLabel().trim());
        p.setUnitPrice(req.getUnitPrice());
        p.setOriginPrice(req.getOriginPrice());
        p.setShortDesc(trimmedOrNull(req.getShortDesc()));
        p.setBullets(normalizeBulletsJson(req.getBullets()));
        p.setNoticeHtml(trimmedOrNull(req.getNoticeHtml()));
        p.setMainImageKey(trimmedOrNull(req.getMainImageKey()));
        p.setDetailImageKeys(normalizeDetailKeysJson(req.getDetailImageKeys()));
        p.setShelfStatus(req.getShelfStatus());
        p.setUsageUrl(trimmedOrNull(req.getUsageUrl()));
        long stock = codeRepository.countByCouponProduct_IdAndStatus(p.getId(), CouponCodeStatus.AVAILABLE);
        return publicCatalogQueryService.toDetailForAdmin(p, stock);
    }

    @Transactional
    public void delete(Long id) {
        CouponProduct p =
                productRepository
                        .findById(id)
                        .orElseThrow(() -> BusinessException.notFound("상품을 찾을 수 없습니다."));
        codeRepository.deleteAllByCouponProduct_Id(p.getId());
        cartLineRepository.deleteByCouponProduct_Id(p.getId());
        productRepository.delete(p);
    }

    @Transactional
    public int appendCouponCodes(Long productId, CouponCodeBulkAppendRequest req) {
        CouponProduct p =
                productRepository
                        .findById(productId)
                        .orElseThrow(() -> BusinessException.notFound("상품을 찾을 수 없습니다."));
        int added = 0;
        List<CouponCode> batch = new ArrayList<>();
        for (String raw : req.getCredentials()) {
            if (raw == null) {
                continue;
            }
            String cred = raw.trim();
            if (cred.isEmpty()) {
                continue;
            }
            if (codeRepository.existsByCouponProduct_IdAndCredential(p.getId(), cred)) {
                throw BusinessException.conflict("중복된 쿠폰 코드가 있습니다: " + cred);
            }
            batch.add(
                    CouponCode.builder()
                            .couponProduct(p)
                            .credential(cred)
                            .status(CouponCodeStatus.AVAILABLE)
                            .build());
            added++;
        }
        codeRepository.saveAll(batch);
        return added;
    }

    /**
     * 엑셀 다열(상품 ID + 쿠폰번호) 형태로 여러 행을 한 번에 등록합니다. 동일 행 파일 내 번호 중복은 제거 순서 유지 후 DB 중복 검사합니다.
     */
    @Transactional
    public int appendCouponCodesBulk(List<CouponCodeBulkRowsRequest.Row> rows) {
        Map<Long, List<String>> grouped = new LinkedHashMap<>();
        for (CouponCodeBulkRowsRequest.Row row : rows) {
            String cred =
                    row.getCredential() == null ? "" : row.getCredential().trim();
            if (cred.isEmpty()) {
                continue;
            }
            grouped.computeIfAbsent(row.getProductId(), k -> new ArrayList<>()).add(cred);
        }
        if (grouped.isEmpty()) {
            return 0;
        }
        Map<Long, CouponProduct> prodCache = new LinkedHashMap<>();
        List<CouponCode> batch = new ArrayList<>();
        int added = 0;
        for (Map.Entry<Long, List<String>> e : grouped.entrySet()) {
            Long pid = e.getKey();
            CouponProduct p =
                    prodCache.computeIfAbsent(
                            pid,
                            id ->
                                    productRepository
                                            .findById(id)
                                            .orElseThrow(
                                                    () ->
                                                            BusinessException.notFound(
                                                                    "상품을 찾을 수 없습니다. id=" + id)));
            List<String> uniq = uniqOrderedStrings(e.getValue());
            for (String cred : uniq) {
                if (codeRepository.existsByCouponProduct_IdAndCredential(p.getId(), cred)) {
                    throw BusinessException.conflict("중복된 쿠폰 코드입니다: " + cred + " (상품 ID " + pid + ")");
                }
                batch.add(
                        CouponCode.builder()
                                .couponProduct(p)
                                .credential(cred)
                                .status(CouponCodeStatus.AVAILABLE)
                                .build());
                added++;
            }
        }
        codeRepository.saveAll(batch);
        return added;
    }

    private static List<String> uniqOrderedStrings(List<String> credentials) {
        Set<String> seen = new HashSet<>();
        List<String> out = new ArrayList<>();
        for (String s : credentials) {
            if (s == null) {
                continue;
            }
            String t = s.trim();
            if (t.isEmpty()) {
                continue;
            }
            if (seen.contains(t)) {
                continue;
            }
            seen.add(t);
            out.add(t);
        }
        return out;
    }

    private String uniqueProductCode() {
        for (int i = 0; i < 40; i++) {
            String c = CouponProductCodeGenerator.random12DigitString();
            if (!productRepository.existsByProductCode(c)) {
                return c;
            }
        }
        throw BusinessException.conflict("상품 코드 생성에 실패했습니다.");
    }

    private static String trimmedOrNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private String normalizeBulletsJson(String bullets) {
        if (bullets == null || bullets.isBlank()) {
            return null;
        }
        try {
            List<String> list = objectMapper.readValue(bullets, new TypeReference<>() {});
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            throw BusinessException.badRequest("bullets 형식은 JSON 문자열 배열이어야 합니다.");
        }
    }

    private String normalizeDetailKeysJson(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            List<String> list = objectMapper.readValue(json, new TypeReference<>() {});
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            throw BusinessException.badRequest("detailImageKeys 형식은 JSON 문자열 배열이어야 합니다.");
        }
    }
}
