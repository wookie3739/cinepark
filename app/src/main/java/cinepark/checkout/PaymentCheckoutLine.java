package cinepark.checkout;

import cinepark.catalog.CouponProduct;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** prepare 시점 장바구니 라인 스냅샷 */
@Entity
@Table(name = "payment_checkout_lines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentCheckoutLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "checkout_id", nullable = false)
    private PaymentCheckout checkout;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "coupon_product_id", nullable = false)
    private CouponProduct couponProduct;

    /** 스냅샷 상품 표시 정보 */
    @Column(name = "product_code", nullable = false, length = 12)
    private String productCode;

    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    /** 스냅샷 단가(원), prepare 시 고정 */
    @Column(name = "unit_price", nullable = false)
    private int unitPrice;

    @Column(nullable = false)
    private int quantity;

    /** 동일 결제건 내 줄 구분 값 — 발급 쿠폰 {@code order_line_id}와 동일해야 함 */
    @Column(name = "line_index", nullable = false)
    private int lineIndex;
}
