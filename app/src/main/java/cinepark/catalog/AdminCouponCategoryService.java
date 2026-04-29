package cinepark.catalog;

import cinepark.catalog.dto.CouponCategoryResponse;
import cinepark.catalog.dto.CouponCategorySaveRequest;
import cinepark.common.BusinessException;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminCouponCategoryService {

    private final CouponCategoryRepository couponCategoryRepository;

    @Transactional(readOnly = true)
    public List<CouponCategoryResponse> listAll() {
        return couponCategoryRepository.findAll().stream()
                .sorted(
                        Comparator.comparingInt(CouponCategory::getSortOrder)
                                .thenComparing(CouponCategory::getId))
                .map(this::map)
                .toList();
    }

    @Transactional(readOnly = true)
    public CouponCategoryResponse get(Long id) {
        return couponCategoryRepository
                .findById(id)
                .map(this::map)
                .orElseThrow(() -> BusinessException.notFound("카테고리를 찾을 수 없습니다."));
    }

    @Transactional
    public CouponCategoryResponse create(CouponCategorySaveRequest req) {
        String code = normalizeCode(req.getCode());
        couponCategoryRepository.findByCodeIgnoreCase(code).ifPresent(x -> conflict());
        CouponCategory c =
                CouponCategory.builder()
                        .code(code)
                        .label(req.getLabel().trim())
                        .sortOrder(req.getSortOrder())
                        .active(req.isActive())
                        .build();
        couponCategoryRepository.save(c);
        return map(c);
    }

    private void conflict() {
        throw BusinessException.conflict("이미 사용 중인 코드입니다.");
    }

    @Transactional
    public CouponCategoryResponse update(Long id, CouponCategorySaveRequest req) {
        CouponCategory c =
                couponCategoryRepository
                        .findById(id)
                        .orElseThrow(() -> BusinessException.notFound("카테고리를 찾을 수 없습니다."));
        String code = normalizeCode(req.getCode());
        couponCategoryRepository
                .findByCodeIgnoreCase(code)
                .filter(o -> !o.getId().equals(id))
                .ifPresent(o -> conflict());
        c.setCode(code);
        c.setLabel(req.getLabel().trim());
        c.setSortOrder(req.getSortOrder());
        c.setActive(req.isActive());
        return map(c);
    }

    @Transactional
    public void delete(Long id) {
        CouponCategory c =
                couponCategoryRepository
                        .findById(id)
                        .orElseThrow(() -> BusinessException.notFound("카테고리를 찾을 수 없습니다."));
        couponCategoryRepository.delete(c);
    }

    private String normalizeCode(String code) {
        return code == null ? "" : code.trim().toLowerCase();
    }

    private CouponCategoryResponse map(CouponCategory c) {
        return CouponCategoryResponse.builder()
                .id(c.getId())
                .code(c.getCode())
                .label(c.getLabel())
                .sortOrder(c.getSortOrder())
                .active(c.isActive())
                .build();
    }
}
