package cinepark.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "coupon_products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 공개 URL·API 식별자 — 숫자 12자리 */
    @Column(name = "product_code", nullable = false, unique = true, length = 12)
    private String productCode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private CouponCategory category;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "brand_label", nullable = false, length = 120)
    private String brandLabel;

    @Column(name = "unit_price", nullable = false)
    private int unitPrice;

    @Column(name = "origin_price", nullable = false)
    private int originPrice;

    @Column(name = "short_desc", columnDefinition = "text")
    private String shortDesc;

    /** JSON 배열 문자열 ["줄1","줄2"] */
    @Column(columnDefinition = "text")
    private String bullets;

    @Column(name = "notice_html", columnDefinition = "text")
    private String noticeHtml;

    @Column(name = "main_image_key", length = 512)
    private String mainImageKey;

    /** JSON 배열 문자열 ["key1","key2"] */
    @Column(name = "detail_image_keys", columnDefinition = "text")
    private String detailImageKeys;

    /** 제휴 사용처(외부) URL — 비어 있으면 프론트에서 링크를 숨긴다. */
    @Column(name = "usage_url", length = 2048)
    private String usageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "shelf_status", nullable = false, length = 20)
    @Builder.Default
    private CouponShelfStatus shelfStatus = CouponShelfStatus.DRAFT;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
