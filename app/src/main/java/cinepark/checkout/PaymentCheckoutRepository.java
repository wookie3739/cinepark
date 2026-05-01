package cinepark.checkout;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PaymentCheckoutRepository extends JpaRepository<PaymentCheckout, Long> {

    Optional<PaymentCheckout> findByMerchantOrderIdAndUserId(String merchantOrderId, Long userId);

    List<PaymentCheckout> findAllByUserIdAndStatus(Long userId, PaymentCheckoutStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from PaymentCheckout c where c.merchantOrderId = :merchantOrderId and c.userId = :userId")
    Optional<PaymentCheckout> lockByMerchantOrderIdAndUserId(
            @Param("merchantOrderId") String merchantOrderId, @Param("userId") Long userId);
}
