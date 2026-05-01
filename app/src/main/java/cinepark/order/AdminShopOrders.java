package cinepark.order;

import cinepark.user.User;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

final class AdminShopOrders {

    private AdminShopOrders() {}

    /** merchantOrderId · toss_payment_key · 구매자 이메일 (부분일치, 대소문자 무시) */
    static Specification<ShopOrder> searchSpec(String keyword) {
        return (Root<ShopOrder> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            if (!StringUtils.hasText(keyword)) {
                return cb.conjunction();
            }
            String term = keyword.trim().toLowerCase();
            String like = "%" + term + "%";
            Predicate merchantLike = cb.like(cb.lower(root.get("merchantOrderId")), like);
            Predicate tossLike =
                    cb.like(cb.lower(cb.coalesce(root.get("tossPaymentKey"), cb.literal(""))), like);

            Subquery<Long> sq = query.subquery(Long.class);
            Root<User> usr = sq.from(User.class);
            sq.select(cb.literal(1L));
            sq.where(cb.and(cb.equal(root.get("userId"), usr.get("id")), cb.like(cb.lower(usr.get("email")), like)));

            List<Predicate> opts = new ArrayList<>();
            if (keyword.trim().chars().allMatch(Character::isDigit)) {
                try {
                    Long idExact = Long.parseLong(keyword.trim());
                    opts.add(cb.equal(root.get("id"), idExact));
                    if (keyword.trim().length() >= 3) {
                        opts.add(cb.equal(root.get("userId"), idExact));
                    }
                } catch (NumberFormatException ignored) {
                    // ignore
                }
            }
            Predicate unionText = cb.or(merchantLike, tossLike, cb.exists(sq));
            return opts.isEmpty() ? unionText : cb.or(unionText, cb.or(opts.toArray(Predicate[]::new)));
        };
    }
}
