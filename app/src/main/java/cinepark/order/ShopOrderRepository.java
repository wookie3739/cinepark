package cinepark.order;

import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface ShopOrderRepository extends JpaRepository<ShopOrder, Long>, JpaSpecificationExecutor<ShopOrder> {

    Page<ShopOrder> findByUserIdOrderByPaidAtDesc(Long userId, Pageable pageable);

    long countByPaidAtGreaterThanEqualAndPaidAtLessThan(Instant paidAtAfterInclusive, Instant paidAtBeforeExclusive);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0L) FROM ShopOrder o WHERE o.paidAt >= ?1 AND o.paidAt < ?2")
    long sumTotalAmountBetween(Instant paidAtAfterInclusive, Instant paidAtBeforeExclusive);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0L) FROM ShopOrder o")
    long sumTotalAmountAll();

    List<ShopOrder> findByPaidAtGreaterThanEqualAndPaidAtLessThanOrderByPaidAtAsc(
            Instant paidAtAfterInclusive, Instant paidAtBeforeExclusive);
}
