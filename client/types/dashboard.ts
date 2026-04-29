export type DailyRevenuePoint = {
  date: string;
  revenue: number;
  orderCount: number;
};

export type AdminDashboardOverview = {
  registeredMemberCount: number;
  unansweredInquiryCount: number;
  couponStockRemaining: number;
  todayNewOrders: number;
  todayRevenue: number;
  totalRevenue: number;
  dailyRevenueSeries: DailyRevenuePoint[];
};
