package cinepark.order;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 결제 확정 시 기록되는 최소 주문 스냅샷. PG(서버 confirm) 연동 후 INSERT 경로를 연결하면 대시보드 매출 집계에 반영된다.
 */
@Entity
@Table(name = "shop_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 결제 확정 금액(원) */
    @Column(name = "total_amount", nullable = false)
    private long totalAmount;

    @Column(name = "paid_at", nullable = false)
    private Instant paidAt;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "merchant_order_id", unique = true, length = 64)
    private String merchantOrderId;

    @Column(name = "toss_payment_key", length = 200)
    private String tossPaymentKey;

    @Column(name = "receipt_url", columnDefinition = "text")
    private String receiptUrl;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
