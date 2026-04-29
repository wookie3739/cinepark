package cinepark.customerservice;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FaqRepository extends JpaRepository<Faq, Long> {

    java.util.List<Faq> findAllByOrderBySortOrderAscCreatedAtDesc();
}
