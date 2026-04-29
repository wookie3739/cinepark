package cinepark.dashboard.dto;

import java.util.List;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AdminDashboardOverviewResponse {
    long registeredMemberCount;
    long unansweredInquiryCount;
    long couponStockRemaining;
    long todayNewOrders;
    long todayRevenue;
    long totalRevenue;
    List<DailyRevenuePointResponse> dailyRevenueSeries;
}
