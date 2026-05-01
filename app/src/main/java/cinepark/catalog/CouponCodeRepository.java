package cinepark.catalog;

import jakarta.persistence.LockModeType;
import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CouponCodeRepository extends JpaRepository<CouponCode, Long> {

    long countByStatus(CouponCodeStatus status);

    long countByCouponProduct_IdAndStatus(Long productId, CouponCodeStatus status);

    List<CouponCode> findByCouponProduct_Id(Long productId);

    Page<CouponCode> findByCouponProduct_Id(Long couponProductId, Pageable pageable);

    boolean existsByCouponProduct_IdAndCredential(Long productId, String credential);

    void deleteAllByCouponProduct_Id(Long couponProductId);

    List<CouponCode> findByOrderIdOrderByOrderLineIdAscIdAsc(Long orderId);

    long countByOrderId(Long orderId);

    @Query("select c.orderId, count(c) from CouponCode c where c.orderId in :ids group by c.orderId")
    List<Object[]> countGroupedByOrderId(@Param("ids") Collection<Long> ids);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query(
            """
                    select c from CouponCode c
                    where c.couponProduct.id = :productId and c.status = :status
                    order by c.id asc
                    """)
    List<CouponCode> lockAvailableForProductLimited(
            @Param("productId") Long productId, @Param("status") CouponCodeStatus status, Pageable pageable);
}
