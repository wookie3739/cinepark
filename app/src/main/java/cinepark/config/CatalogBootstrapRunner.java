package cinepark.config;

import cinepark.catalog.CouponCategory;
import cinepark.catalog.CouponCategoryRepository;
import cinepark.catalog.CouponCode;
import cinepark.catalog.CouponCodeRepository;
import cinepark.catalog.CouponCodeStatus;
import cinepark.catalog.CouponProduct;
import cinepark.catalog.CouponProductCodeGenerator;
import cinepark.catalog.CouponProductRepository;
import cinepark.catalog.CouponShelfStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

@Configuration
@Slf4j
@RequiredArgsConstructor
public class CatalogBootstrapRunner {

    private final CouponCategoryRepository categoryRepository;
    private final CouponProductRepository productRepository;
    private final CouponCodeRepository couponCodeRepository;
    private final ObjectMapper objectMapper;

    @Bean
    @Order(40)
    ApplicationRunner seedCouponCatalog() {
        return args -> {
            if (categoryRepository.count() > 0L) {
                return;
            }
            List<CouponCategory> saved = new ArrayList<>();
            saved.add(
                    saveCategory(
                            CouponCategory.builder()
                                    .code("movie")
                                    .label("영화관")
                                    .sortOrder(0)
                                    .active(true)
                                    .build()));
            saved.add(
                    saveCategory(
                            CouponCategory.builder()
                                    .code("cafe")
                                    .label("카페")
                                    .sortOrder(1)
                                    .active(true)
                                    .build()));
            saved.add(
                    saveCategory(
                            CouponCategory.builder()
                                    .code("restaurant")
                                    .label("음식점")
                                    .sortOrder(2)
                                    .active(true)
                                    .build()));
            saved.add(
                    saveCategory(
                            CouponCategory.builder()
                                    .code("convenience")
                                    .label("편의점")
                                    .sortOrder(3)
                                    .active(true)
                                    .build()));
            saved.add(
                    saveCategory(
                            CouponCategory.builder()
                                    .code("beauty")
                                    .label("뷰티")
                                    .sortOrder(4)
                                    .active(true)
                                    .build()));

            CouponCategory movie =
                    saved.stream().filter(c -> "movie".equalsIgnoreCase(c.getCode())).findFirst().orElseThrow();

            String bulletsJson =
                    objectMapper.writeValueAsString(
                            List.of(
                                    "씨네파크 사용 안내에 따라 1매 단위로 사용 가능",
                                    "유효기간 및 사용 가능 극장은 발급 시 안내 페이지를 따름",
                                    "결제 후 취소환불은 정책에 따라 처리 (목업)"));

            String productCode = nextUniqueProductCode();

            CouponProduct product =
                    CouponProduct.builder()
                            .productCode(productCode)
                            .category(movie)
                            .name("토탈쿠폰 1매")
                            .brandLabel("CINEPARK")
                            .unitPrice(50_000)
                            .originPrice(50_000)
                            .shortDesc("결제 후 마이페이지에서 쿠폰번호를 확인하고 시네파크 사용 채널에서 이용하세요.")
                            .bullets(bulletsJson)
                            .noticeHtml(
                                    "실제 결제는 PortOne / TossPayments 연동 시점에 활성화됩니다. 본 페이지는 플로우 목업입니다.")
                            .mainImageKey(null)
                            .detailImageKeys(null)
                            .shelfStatus(CouponShelfStatus.ON_SALE)
                            .build();
            productRepository.save(product);

            for (int i = 1; i <= 30; i++) {
                String credential = "CINE-DEMO-" + String.format("%05d", i);
                couponCodeRepository.save(
                        CouponCode.builder()
                                .couponProduct(product)
                                .credential(credential)
                                .status(CouponCodeStatus.AVAILABLE)
                                .build());
            }
            log.warn(
                    "쿠폰 카탈로그 시드 완료(productCode={}). 운영에서는 시드 제거 또는 카테고리 수동 관리를 검토.",
                    productCode);
        };
    }

    private CouponCategory saveCategory(CouponCategory c) {
        return categoryRepository.save(c);
    }

    private String nextUniqueProductCode() {
        for (int attempt = 0; attempt < 50; attempt++) {
            String code = CouponProductCodeGenerator.random12DigitString();
            if (!productRepository.existsByProductCode(code)) {
                return code;
            }
        }
        throw new IllegalStateException("product_code 생성 충돌");
    }
}
