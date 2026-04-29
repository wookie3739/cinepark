package cinepark.catalog;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CouponProductRepository extends JpaRepository<CouponProduct, Long> {

    Optional<CouponProduct> findByProductCode(String productCode);

    boolean existsByProductCode(String productCode);

    @Query(
            "SELECT p FROM CouponProduct p JOIN p.category c WHERE p.shelfStatus = :sale "
                    + "AND c.code = :categoryCode "
                    + "AND EXISTS (SELECT 1 FROM CouponCode cc WHERE cc.couponProduct = p AND cc.status = :avail)")
    Page<CouponProduct> findSellablePageByCategory(
            @Param("sale") CouponShelfStatus sale,
            @Param("avail") CouponCodeStatus available,
            @Param("categoryCode") String categoryCode,
            Pageable pageable);

    @Query(
            "SELECT p FROM CouponProduct p WHERE p.shelfStatus = :sale "
                    + "AND EXISTS (SELECT 1 FROM CouponCode cc WHERE cc.couponProduct = p AND cc.status = :avail)")
    Page<CouponProduct> findSellablePage(
            @Param("sale") CouponShelfStatus sale, @Param("avail") CouponCodeStatus avail, Pageable pageable);

    /** 판매 중·재고 있음 — 사용 URL 유무와 관계없이 전부(이름 순) */
    @Query(
            "SELECT p FROM CouponProduct p WHERE p.shelfStatus = :sale "
                    + "AND EXISTS (SELECT 1 FROM CouponCode cc WHERE cc.couponProduct = p AND cc.status = :avail) "
                    + "ORDER BY p.name ASC")
    List<CouponProduct> findSellableWithStockOrderedByName(
            @Param("sale") CouponShelfStatus sale, @Param("avail") CouponCodeStatus avail);
}
