package cinepark.catalog;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CouponCategoryRepository extends JpaRepository<CouponCategory, Long> {

    Optional<CouponCategory> findByCodeIgnoreCase(String code);

    @Query("SELECT c FROM CouponCategory c WHERE c.active = true ORDER BY c.sortOrder ASC, c.id ASC")
    List<CouponCategory> findAllActiveOrderBySort();
}
