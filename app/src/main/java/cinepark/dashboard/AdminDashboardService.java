package cinepark.dashboard;

import cinepark.catalog.CouponCodeRepository;
import cinepark.catalog.CouponCodeStatus;
import cinepark.customerservice.CustomerInquiryRepository;
import cinepark.customerservice.InquiryStatus;
import cinepark.dashboard.dto.AdminDashboardOverviewResponse;
import cinepark.dashboard.dto.DailyRevenuePointResponse;
import cinepark.order.ShopOrder;
import cinepark.order.ShopOrderRepository;
import cinepark.user.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    static final ZoneId ZONE_SEOUL = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ISO_LOCAL_DATE;

    private final UserRepository userRepository;
    private final CustomerInquiryRepository inquiryRepository;
    private final CouponCodeRepository couponCodeRepository;
    private final ShopOrderRepository shopOrderRepository;

    @Transactional(readOnly = true)
    public AdminDashboardOverviewResponse overview(LocalDate chartFrom, LocalDate chartTo) {
        LocalDate from = chartFrom != null ? chartFrom : LocalDate.now(ZONE_SEOUL).minusDays(29);
        LocalDate to = chartTo != null ? chartTo : LocalDate.now(ZONE_SEOUL);
        if (from.isAfter(to)) {
            LocalDate t = from;
            from = to;
            to = t;
        }

        long members = userRepository.count();
        long unanswered = inquiryRepository.countByStatus(InquiryStatus.OPEN);
        long stockRemaining = couponCodeRepository.countByStatus(CouponCodeStatus.AVAILABLE);

        LocalDate today = LocalDate.now(ZONE_SEOUL);
        Instant dayStart = today.atStartOfDay(ZONE_SEOUL).toInstant();
        Instant dayEndExclusive = today.plusDays(1).atStartOfDay(ZONE_SEOUL).toInstant();

        long todayOrders = shopOrderRepository.countByPaidAtGreaterThanEqualAndPaidAtLessThan(dayStart, dayEndExclusive);
        long todayRevenue =
                shopOrderRepository.sumTotalAmountBetween(dayStart, dayEndExclusive);
        long totalRevenue = shopOrderRepository.sumTotalAmountAll();

        List<DailyRevenuePointResponse> series = buildDailySeries(from, to);

        return AdminDashboardOverviewResponse.builder()
                .registeredMemberCount(members)
                .unansweredInquiryCount(unanswered)
                .couponStockRemaining(stockRemaining)
                .todayNewOrders(todayOrders)
                .todayRevenue(todayRevenue)
                .totalRevenue(totalRevenue)
                .dailyRevenueSeries(series)
                .build();
    }

    private List<DailyRevenuePointResponse> buildDailySeries(LocalDate from, LocalDate to) {
        Instant rangeStart = from.atStartOfDay(ZONE_SEOUL).toInstant();
        Instant rangeEndExclusive = to.plusDays(1).atStartOfDay(ZONE_SEOUL).toInstant();

        List<ShopOrder> orders =
                shopOrderRepository.findByPaidAtGreaterThanEqualAndPaidAtLessThanOrderByPaidAtAsc(
                        rangeStart, rangeEndExclusive);

        Map<LocalDate, long[]> acc = new HashMap<>();
        for (ShopOrder o : orders) {
            LocalDate d =
                    o.getPaidAt().atZone(ZONE_SEOUL).toLocalDate();
            long[] pair = acc.computeIfAbsent(d, k -> new long[2]);
            pair[0] += o.getTotalAmount();
            pair[1] += 1;
        }

        List<DailyRevenuePointResponse> out = new ArrayList<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            long[] pair = acc.getOrDefault(d, new long[2]);
            out.add(
                    DailyRevenuePointResponse.builder()
                            .date(ISO_DATE.format(d))
                            .revenue(pair[0])
                            .orderCount(pair[1])
                            .build());
        }
        return out;
    }
}
