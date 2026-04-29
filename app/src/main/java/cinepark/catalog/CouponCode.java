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
@Table(name = "coupon_codes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "coupon_product_id", nullable = false)
    private CouponProduct couponProduct;

    @Column(nullable = false, length = 255)
    private String credential;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CouponCodeStatus status = CouponCodeStatus.AVAILABLE;

    @Column(name = "issued_to_user_id")
    private Long issuedToUserId;

    @Column(name = "order_id")
    private Long orderId;

    /**
     * 동일 결제 건(order_id) 안에서 주문 라인(상품 SKU·수량 단위 줄)별로 발급된 코드를 구분할 때 채운다.
     * 다건 구매 등 결제 확정 처리에서 한 라인에 대해 생성된 모든 coupon_codes 행이 같은 값을 공유하게 된다 (후속 주문 기능).
     */
    @Column(name = "order_line_id")
    private Long orderLineId;

    @Column(name = "issued_at")
    private Instant issuedAt;

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
