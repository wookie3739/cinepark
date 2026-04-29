package cinepark.order;

import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ShopOrderRepository extends JpaRepository<ShopOrder, Long> {

    long countByPaidAtGreaterThanEqualAndPaidAtLessThan(Instant paidAtAfterInclusive, Instant paidAtBeforeExclusive);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0L) FROM ShopOrder o WHERE o.paidAt >= ?1 AND o.paidAt < ?2")
    long sumTotalAmountBetween(Instant paidAtAfterInclusive, Instant paidAtBeforeExclusive);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0L) FROM ShopOrder o")
    long sumTotalAmountAll();

    List<ShopOrder> findByPaidAtGreaterThanEqualAndPaidAtLessThanOrderByPaidAtAsc(
            Instant paidAtAfterInclusive, Instant paidAtBeforeExclusive);
}
