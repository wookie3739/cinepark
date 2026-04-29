package cinepark.catalog;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CartLineRepository extends JpaRepository<CartLine, Long> {

    List<CartLine> findByUserIdOrderByUpdatedAtDesc(Long userId);

    Optional<CartLine> findByUserIdAndCouponProduct_Id(Long userId, Long couponProductId);

    void deleteByUserIdAndCouponProduct_Id(Long userId, Long couponProductId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM CartLine cl WHERE cl.userId = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM CartLine cl WHERE cl.couponProduct.id = :pid")
    void deleteByCouponProduct_Id(@Param("pid") Long pid);
}
