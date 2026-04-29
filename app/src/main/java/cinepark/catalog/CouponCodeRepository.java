package cinepark.catalog;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponCodeRepository extends JpaRepository<CouponCode, Long> {

    long countByStatus(CouponCodeStatus status);

    long countByCouponProduct_IdAndStatus(Long productId, CouponCodeStatus status);

    List<CouponCode> findByCouponProduct_Id(Long productId);

    Page<CouponCode> findByCouponProduct_Id(Long couponProductId, Pageable pageable);

    boolean existsByCouponProduct_IdAndCredential(Long productId, String credential);

    void deleteAllByCouponProduct_Id(Long couponProductId);
}
