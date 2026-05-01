package cinepark.checkout;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "payment_checkouts",
        uniqueConstraints = @UniqueConstraint(name = "uk_payment_checkouts_merchant_order", columnNames = "merchant_order_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentCheckout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 토스 orderId 및 가맹 주문번호 */
    @Column(name = "merchant_order_id", nullable = false, length = 64)
    private String merchantOrderId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "total_amount", nullable = false)
    private long totalAmount;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PaymentCheckoutStatus status = PaymentCheckoutStatus.PENDING;

    @Column(name = "paid_at")
    private Instant paidAt;

    /** 결제 성공 후 연결된 주문 PK */
    @Column(name = "shop_order_id")
    private Long shopOrderId;

    /** 토스 paymentKey 확정값 */
    @Column(name = "toss_payment_key", length = 200)
    private String tossPaymentKey;

    /** 토스 승인 응답 기준 매출전표 스냅샷(null 가능) */
    @Column(name = "receipt_url", columnDefinition = "text")
    private String receiptUrl;

    @Column(name = "order_name", length = 240)
    private String orderName;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "checkout", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PaymentCheckoutLine> lines = new ArrayList<>();

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public void addLine(PaymentCheckoutLine line) {
        line.setCheckout(this);
        lines.add(line);
    }
}
