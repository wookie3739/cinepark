package cinepark.dashboard.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DailyRevenuePointResponse {
    String date;
    long revenue;
    long orderCount;
}
