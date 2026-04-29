package cinepark.customerservice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerInquiryRepository extends JpaRepository<CustomerInquiry, Long> {

    Page<CustomerInquiry> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<CustomerInquiry> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByStatus(InquiryStatus status);
}
