import { apiClient } from "@/services/api/client";

export interface BillingCycleCountRes {
  billing_cycle: string;
  active_subscriptions: number;
}

export interface PlanTypeCountRes {
  plan_type: string;
  active_subscriptions: number;
}

export interface RefundTierCountsRes {
  FULL?: number;
  HALF?: number;
  NONE?: number;
}

export interface MealCancellationEngagementRes {
  total: number;
  unique_customers: number;
  per_active_customer: number;
  refund_total: number;
  by_refund_tier?: RefundTierCountsRes;
}

export interface OptionalMealEngagementRes {
  total: number;
  unique_customers: number;
  adoption_pct: number;
}

export interface CustomerEngagementRes {
  active_customers: number;
  auto_renew_pct: number;
  currency: string;
  from: string;
  to: string;
  by_plan_type: PlanTypeCountRes[];
  by_billing_cycle: BillingCycleCountRes[];
  meal_cancellations: MealCancellationEngagementRes;
  optional_meal_requests: OptionalMealEngagementRes;
}

export interface GetCustomerEngagementParams {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

export interface CustomerStatusSegment {
  key: "active" | "payment_failed" | "pending" | "lapsed" | "never_subscribed" | string;
  count: number;
  pct: number;
}

export interface CustomerStatusBreakdownRes {
  total: number;
  inactive_accounts: number;
  segments: CustomerStatusSegment[];
}

export interface AnalyticsStatCard {
  value: number;
  previous_value: number;
  change_pct: number | null;
  trend: "up" | "down" | "flat" | string;
}

export interface AnalyticsRangeRes {
  from: string;
  to: string;
  previous_from?: string;
  previous_to?: string;
}

export interface CustomerSummaryRes {
  total_customers: AnalyticsStatCard;
  new_customers: AnalyticsStatCard;
  active_subscribers: AnalyticsStatCard;
  churned_customers: AnalyticsStatCard;
  churn_rate_pct: AnalyticsStatCard;
  conversion_rate_pct: AnalyticsStatCard;
  avg_lifetime_value: AnalyticsStatCard;
  wallet_liability: AnalyticsStatCard;
  currency: string;
  range?: AnalyticsRangeRes;
}

export interface GetCustomerSummaryParams {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

export interface DeliverySummaryRes {
  expected_deliveries: AnalyticsStatCard;
  delivered: AnalyticsStatCard;
  missed: AnalyticsStatCard;
  completion_rate_pct: AnalyticsStatCard;
  cancellation_rate_pct: AnalyticsStatCard;
  late_marked_pct: AnalyticsStatCard;
  avg_daily_deliveries: AnalyticsStatCard;
  meal_cancellations: AnalyticsStatCard;
  optional_swaps: AnalyticsStatCard;
  pending_today: number;
  range?: AnalyticsRangeRes;
}

export interface GetDeliverySummaryParams {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

export interface ForecastDayRes {
  date: string;
  weekday: string;
  expected: number;
  fixed: number;
  custom: number;
  cancelled: number;
  optional_swaps: number;
}

export interface ForecastRes {
  days: number;
  total_expected: number;
  points: ForecastDayRes[];
}

export interface GetDeliveryForecastParams {
  days?: number; // 1-30, default 7
}

export interface OptionalMealItemRes {
  meal_id: string;
  name: string;
  requests: number;
  unique_customers: number;
}

export interface OptionalMealsRes {
  from: string;
  to: string;
  items: OptionalMealItemRes[];
}

export interface GetDeliveryOptionalMealsParams {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  limit?: number; // 1-50, default 10
}

export interface TrendPointRes {
  bucket: string;
  scheduled: number;
  cancelled: number;
  expected: number;
  delivered: number;
  missed: number;
  optional_swaps: number;
  completion_rate_pct: number;
}

export interface TrendRes {
  from: string;
  to: string;
  granularity: "day" | "week" | "month";
  points: TrendPointRes[];
}

export interface GetDeliveryTrendParams {
  from?: string;
  to?: string;
  granularity?: "day" | "week" | "month";
}

export type DeliveryBreakdownDimension = "plan_type" | "package" | "weekday";

export interface DeliveryBreakdownItemRes {
  key: string;
  label: string;
  expected: number;
  delivered: number;
  missed: number;
  cancelled: number;
  optional_swaps: number;
  share_pct: number;
  completion_rate_pct: number;
}

export interface DeliveryBreakdownRes {
  by: DeliveryBreakdownDimension;
  from: string;
  to: string;
  items: DeliveryBreakdownItemRes[];
}

export interface GetDeliveryBreakdownParams {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  by?: DeliveryBreakdownDimension;
}

export interface SalesSummaryRes {
  gross_revenue: AnalyticsStatCard;
  net_revenue: AnalyticsStatCard;
  cash_collected: AnalyticsStatCard;
  mrr: AnalyticsStatCard;
  arpu: AnalyticsStatCard;
  avg_invoice_value: AnalyticsStatCard;
  paid_invoices: AnalyticsStatCard;
  discounts_given: AnalyticsStatCard;
  refunds_issued: AnalyticsStatCard;
  wallet_credit_used: AnalyticsStatCard;
  renewal_success_rate_pct: AnalyticsStatCard;
  currency: string;
  range?: AnalyticsRangeRes;
}

export interface GetSalesSummaryParams {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

export type SalesBreakdownDimension = "package" | "plan" | "billing_cycle" | "plan_type";

export interface SalesBreakdownItemRes {
  key: string;
  label: string;
  revenue: number;
  invoices: number;
  customers: number;
  share_pct: number;
}

export interface SalesBreakdownRes {
  by: SalesBreakdownDimension;
  currency: string;
  from: string;
  to: string;
  total_revenue: number;
  items: SalesBreakdownItemRes[];
}

export interface GetSalesBreakdownParams {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  by?: SalesBreakdownDimension;
}

export interface SalesRevenuePointRes {
  bucket: string;
  gross: number;
  discounts: number;
  net: number;
  wallet_credit: number;
  cash_collected: number;
  invoices: number;
  new_revenue: number;
  renewal_revenue: number;
}

export interface SalesRevenueRes {
  currency: string;
  from: string;
  to: string;
  granularity: "day" | "week" | "month";
  points: SalesRevenuePointRes[];
}

export interface GetSalesRevenueParams {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  granularity?: "day" | "week" | "month";
}

export interface SalesDiscountItemRes {
  discount_id: string;
  name: string;
  coupon_code: string;
  percentage: number;
  redemptions: number;
  unique_customers: number;
  discount_total: number;
  avg_discount: number;
  net_revenue: number;
}

export interface SalesDiscountsRes {
  currency: string;
  from: string;
  to: string;
  total_discount: number;
  items: SalesDiscountItemRes[];
}

export interface GetSalesDiscountsParams {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

export interface CheckoutHealthRes {
  total: number;
  success: number;
  pending: number;
  failed: number;
  success_rate_pct: number;
}

export interface RenewalHealthRes {
  attempts: number;
  successes: number;
  failures: number;
  success_rate_pct: number;
}

export interface AtRiskRes {
  subscriptions: number;
  monthly_value: number;
}

export interface FailureReasonRes {
  reason: string;
  count: number;
}

export interface SalesPaymentsRes {
  currency: string;
  from: string;
  to: string;
  checkout: CheckoutHealthRes;
  renewals: RenewalHealthRes;
  at_risk: AtRiskRes;
  top_failure_reasons: FailureReasonRes[];
}

export interface GetSalesPaymentsParams {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

export interface CohortPeriodRes {
  offset: number;
  active_customers: number;
  retention_pct: number;
  revenue: number;
}

export interface CohortRowRes {
  cohort: string;
  customers: number;
  periods: CohortPeriodRes[];
}

export interface SalesCohortsRes {
  currency: string;
  months: number;
  cohorts: CohortRowRes[];
}

export interface GetSalesCohortsParams {
  months?: number; // 3 - 12 (default 6)
}

export interface TopCustomerItem {
  user_id: string;
  email: string;
  revenue: number;
  paid_invoices: number;
  cancellations: number;
  status: "active" | "inactive" | string;
  joined_at?: string;
  last_paid_at?: string;
}

export interface OffsetMeta {
  has_next: boolean;
  has_prev: boolean;
  limit: number;
  page: number;
  total_pages: number;
  total_rows: number;
}

export interface TopCustomersRes {
  data: TopCustomerItem[];
  pagination: OffsetMeta;
}

export interface GetTopCustomersParams {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  sort?: "revenue" | "paid_invoices" | "cancellations";
  page?: number;
  limit?: number;
}

interface ApiDataWrapper<T> {
  success?: boolean;
  data?: T;
  pagination?: OffsetMeta;
}

export const analyticsService = {
  /**
   * Fetch customer engagement metrics: active customers, auto-renew %,
   * active subscriptions by plan type & billing cycle, meal cancellations and optional meal requests.
   * GET /api/v1/analytics/customers/engagement
   */
  async getCustomerEngagement(params: GetCustomerEngagementParams = {}): Promise<CustomerEngagementRes | null> {
    try {
      const queryParams: Record<string, string> = {};
      if (params.from) queryParams.from = params.from;
      if (params.to) queryParams.to = params.to;

      const response = await apiClient.get<ApiDataWrapper<CustomerEngagementRes> | CustomerEngagementRes>(
        "/api/v1/analytics/customers/engagement",
        { params: queryParams }
      );

      const body = response.data;
      if (!body) return null;
      if ("data" in body && body.data) return body.data;
      return body as CustomerEngagementRes;
    } catch (err) {
      console.warn("[analyticsService] Error fetching customer engagement:", err);
      return null;
    }
  },

  /**
   * Fetch customer subscription status breakdown:
   * Current snapshot placing each customer in one state by precedence:
   * active → payment_failed → pending → lapsed → never_subscribed.
   * GET /api/v1/analytics/customers/status-breakdown
   */
  async getCustomerStatusBreakdown(): Promise<CustomerStatusBreakdownRes | null> {
    try {
      const response = await apiClient.get<ApiDataWrapper<CustomerStatusBreakdownRes> | CustomerStatusBreakdownRes>(
        "/api/v1/analytics/customers/status-breakdown"
      );
      const body = response.data;
      if (!body) return null;
      if ("data" in body && body.data) return body.data;
      return body as CustomerStatusBreakdownRes;
    } catch (err) {
      console.warn("[analyticsService] Error fetching customer status breakdown:", err);
      return null;
    }
  },

  /**
   * Fetch customer analytics stat cards (overview summary):
   * KPI cards for the range, each compared with the previous period of equal length.
   * GET /api/v1/analytics/customers/summary
   */
  async getCustomerSummary(params: GetCustomerSummaryParams = {}): Promise<CustomerSummaryRes | null> {
    try {
      const queryParams: Record<string, string> = {};
      if (params.from) queryParams.from = params.from;
      if (params.to) queryParams.to = params.to;

      const response = await apiClient.get<ApiDataWrapper<CustomerSummaryRes> | CustomerSummaryRes>(
        "/api/v1/analytics/customers/summary",
        { params: queryParams }
      );

      const body = response.data;
      if (!body) return null;
      if ("data" in body && body.data) return body.data;
      return body as CustomerSummaryRes;
    } catch (err) {
      console.warn("[analyticsService] Error fetching customer summary:", err);
      return null;
    }
  },

  /**
   * Fetch top customers leaderboard:
   * Customers ranked by revenue, paid invoices or meal cancellations within the range.
   * GET /api/v1/analytics/customers/top
   */
  async getTopCustomers(params: GetTopCustomersParams = {}): Promise<TopCustomersRes | null> {
    try {
      const queryParams: Record<string, string | number> = {};
      if (params.from) queryParams.from = params.from;
      if (params.to) queryParams.to = params.to;
      if (params.sort) queryParams.sort = params.sort;
      if (params.page !== undefined) queryParams.page = params.page;
      if (params.limit !== undefined) queryParams.limit = params.limit;

      const response = await apiClient.get<ApiDataWrapper<TopCustomersRes | TopCustomerItem[]> | TopCustomersRes>(
        "/api/v1/analytics/customers/top",
        { params: queryParams }
      );

      const body = response.data;
      if (!body) return null;
      if ("data" in body && body.data) {
        if (typeof body.data === "object" && "data" in body.data) {
          return body.data as TopCustomersRes;
        }
        if (Array.isArray(body.data)) {
          return {
            data: body.data,
            pagination: body.pagination || {
              has_next: false,
              has_prev: false,
              limit: params.limit || 10,
              page: params.page || 1,
              total_pages: 1,
              total_rows: body.data.length,
            },
          };
        }
      }
      return body as TopCustomersRes;
    } catch (err) {
      console.warn("[analyticsService] Error fetching top customers:", err);
      return null;
    }
  },

  /**
   * Fetch delivery analytics stat cards (overview summary):
   * Delivery KPIs for the range, each compared with the previous period of equal length.
   * Expected deliveries are scheduled meals minus cancellations.
   * Completion and missed only count closed days (before today); today's open work is pending_today.
   * Late-marked = marked delivered after the delivery date.
   * Dates are inclusive, Asia/Colombo; defaults to the last 30 days.
   * GET /api/v1/analytics/deliveries/summary
   */
  async getDeliverySummary(params: GetDeliverySummaryParams = {}): Promise<DeliverySummaryRes | null> {
    try {
      const queryParams: Record<string, string> = {};
      if (params.from) queryParams.from = params.from;
      if (params.to) queryParams.to = params.to;

      const response = await apiClient.get<ApiDataWrapper<DeliverySummaryRes> | DeliverySummaryRes>(
        "/api/v1/analytics/deliveries/summary",
        { params: queryParams }
      );

      const body = response.data;
      if (!body) return null;
      if ("data" in body && body.data) return body.data;
      return body as DeliverySummaryRes;
    } catch (err) {
      console.warn("[analyticsService] Error fetching delivery summary:", err);
      return null;
    }
  },

  /**
   * Fetch upcoming delivery forecast:
   * Expected deliveries for each of the next N days starting today,
   * split into FIXED and CUSTOM, with known cancellations and optional meal swaps.
   * Uses ACTIVE subscriptions and assumes auto-renewing FIXED plans renew.
   * GET /api/v1/analytics/deliveries/forecast
   */
  async getDeliveryForecast(params: GetDeliveryForecastParams = {}): Promise<ForecastRes | null> {
    try {
      const queryParams: Record<string, number> = {};
      if (params.days !== undefined) queryParams.days = params.days;

      const response = await apiClient.get<ApiDataWrapper<ForecastRes> | ForecastRes>(
        "/api/v1/analytics/deliveries/forecast",
        { params: queryParams }
      );

      const body = response.data;
      if (!body) return null;
      if ("data" in body && body.data) return body.data;
      return body as ForecastRes;
    } catch (err) {
      console.warn("[analyticsService] Error fetching delivery forecast:", err);
      return null;
    }
  },

  /**
   * Fetch most requested optional meals for delivery dates in the range, excluding cancelled requests.
   * GET /api/v1/analytics/deliveries/optional-meals
   */
  async getDeliveryOptionalMeals(params: GetDeliveryOptionalMealsParams = {}): Promise<OptionalMealsRes | null> {
    try {
      const queryParams: Record<string, string | number> = {};
      if (params.from) queryParams.from = params.from;
      if (params.to) queryParams.to = params.to;
      if (params.limit !== undefined) queryParams.limit = params.limit;

      const response = await apiClient.get<ApiDataWrapper<OptionalMealsRes> | OptionalMealsRes>(
        "/api/v1/analytics/deliveries/optional-meals",
        { params: queryParams }
      );

      const body = response.data;
      if (!body) return null;
      if ("data" in body && body.data) return body.data;
      return body as OptionalMealsRes;
    } catch (err) {
      console.warn("[analyticsService] Error fetching delivery optional meals:", err);
      return null;
    }
  },

  /**
   * Fetch delivery trend: scheduled, cancelled, expected, delivered and missed deliveries + optional meal swaps per bucket.
   * GET /api/v1/analytics/deliveries/trend
   */
  async getDeliveryTrend(params: GetDeliveryTrendParams = {}): Promise<TrendRes | null> {
    try {
      const queryParams: Record<string, string> = {};
      if (params.from) queryParams.from = params.from;
      if (params.to) queryParams.to = params.to;
      if (params.granularity) queryParams.granularity = params.granularity;

      const response = await apiClient.get<ApiDataWrapper<TrendRes> | TrendRes>(
        "/api/v1/analytics/deliveries/trend",
        { params: queryParams }
      );

      const body = response.data;
      if (!body) return null;
      if ("data" in body && body.data) return body.data;
      return body as TrendRes;
    } catch (err) {
      console.warn("[analyticsService] Error fetching delivery trend:", err);
      return null;
    }
  },

  /**
   * Fetch delivery breakdown: delivery volume, completion and cancellations in the range split by plan type, package or weekday.
   * GET /api/v1/analytics/deliveries/breakdown
   */
  async getDeliveryBreakdown(params: GetDeliveryBreakdownParams = {}): Promise<DeliveryBreakdownRes | null> {
    try {
      const queryParams: Record<string, string> = {};
      if (params.from) queryParams.from = params.from;
      if (params.to) queryParams.to = params.to;
      if (params.by) queryParams.by = params.by;

      const response = await apiClient.get<ApiDataWrapper<DeliveryBreakdownRes> | DeliveryBreakdownRes>(
        "/api/v1/analytics/deliveries/breakdown",
        { params: queryParams }
      );

      const body = response.data;
      if (!body) return null;
      if ("data" in body && body.data) return body.data;
      return body as DeliveryBreakdownRes;
    } catch (err) {
      console.warn("[analyticsService] Error fetching delivery breakdown:", err);
      return null;
    }
  },

  /**
   * Fetch revenue KPIs for the range, each compared with the previous period of equal length.
   * GET /api/v1/analytics/sales/summary
   */
  async getSalesSummary(params: GetSalesSummaryParams = {}): Promise<SalesSummaryRes | null> {
    try {
      const queryParams: Record<string, string> = {};
      if (params.from) queryParams.from = params.from;
      if (params.to) queryParams.to = params.to;

      const response = await apiClient.get<ApiDataWrapper<SalesSummaryRes> | SalesSummaryRes>(
        "/api/v1/analytics/sales/summary",
        { params: queryParams }
      );

      const body = response.data;
      if (!body) return null;
      if ("data" in body && body.data) return body.data;
      return body as SalesSummaryRes;
    } catch (err) {
      console.warn("[analyticsService] Error fetching sales summary:", err);
      return null;
    }
  },

  /**
   * Fetch net revenue in the range split by package, subscription plan, billing cycle or plan type.
   * GET /api/v1/analytics/sales/breakdown
   */
  async getSalesBreakdown(params: GetSalesBreakdownParams = {}): Promise<SalesBreakdownRes | null> {
    try {
      const queryParams: Record<string, string> = {};
      if (params.from) queryParams.from = params.from;
      if (params.to) queryParams.to = params.to;
      if (params.by) queryParams.by = params.by;

      const response = await apiClient.get<ApiDataWrapper<SalesBreakdownRes> | SalesBreakdownRes>(
        "/api/v1/analytics/sales/breakdown",
        { params: queryParams }
      );

      const body = response.data;
      if (!body) return null;
      if ("data" in body && body.data) return body.data;
      return body as SalesBreakdownRes;
    } catch (err) {
      console.warn("[analyticsService] Error fetching sales breakdown:", err);
      return null;
    }
  },

  /**
   * Fetch revenue time series: gross, discounts, net, wallet credit, cash collected, and invoices per bucket.
   * GET /api/v1/analytics/sales/revenue
   */
  async getSalesRevenue(params: GetSalesRevenueParams = {}): Promise<SalesRevenueRes | null> {
    try {
      const queryParams: Record<string, string> = {};
      if (params.from) queryParams.from = params.from;
      if (params.to) queryParams.to = params.to;
      if (params.granularity) queryParams.granularity = params.granularity;

      const response = await apiClient.get<ApiDataWrapper<SalesRevenueRes> | SalesRevenueRes>(
        "/api/v1/analytics/sales/revenue",
        { params: queryParams }
      );

      const body = response.data;
      if (!body) return null;
      if ("data" in body && body.data) return body.data;
      return body as SalesRevenueRes;
    } catch (err) {
      console.warn("[analyticsService] Error fetching sales revenue:", err);
      return null;
    }
  },

  /**
   * Fetch discount performance for paid invoices in the range:
   * Redemptions, unique customers, total and average discount, and net revenue of discounted invoices.
   * GET /api/v1/analytics/sales/discounts
   */
  async getSalesDiscounts(params: GetSalesDiscountsParams = {}): Promise<SalesDiscountsRes | null> {
    try {
      const queryParams: Record<string, string> = {};
      if (params.from) queryParams.from = params.from;
      if (params.to) queryParams.to = params.to;

      const response = await apiClient.get<ApiDataWrapper<SalesDiscountsRes> | SalesDiscountsRes>(
        "/api/v1/analytics/sales/discounts",
        { params: queryParams }
      );

      const body = response.data;
      if (!body) return null;
      if ("data" in body && body.data) return body.data;
      return body as SalesDiscountsRes;
    } catch (err) {
      console.warn("[analyticsService] Error fetching sales discounts:", err);
      return null;
    }
  },

  /**
   * Fetch payment health: First-checkout outcomes, recurring billing success,
   * top recurring failure reasons, and value of subscriptions currently in PAYMENT_FAILED.
   * GET /api/v1/analytics/sales/payments
   */
  async getSalesPayments(params: GetSalesPaymentsParams = {}): Promise<SalesPaymentsRes | null> {
    try {
      const queryParams: Record<string, string> = {};
      if (params.from) queryParams.from = params.from;
      if (params.to) queryParams.to = params.to;

      const response = await apiClient.get<ApiDataWrapper<SalesPaymentsRes> | SalesPaymentsRes>(
        "/api/v1/analytics/sales/payments",
        { params: queryParams }
      );

      const body = response.data;
      if (!body) return null;
      if ("data" in body && body.data) return body.data;
      return body as SalesPaymentsRes;
    } catch (err) {
      console.warn("[analyticsService] Error fetching sales payments:", err);
      return null;
    }
  },

  /**
   * Fetch revenue retention cohorts:
   * Customers grouped by the month of their first paid invoice; for each following month,
   * how many paid again (retention %) and their net revenue. Covers the last N months.
   * GET /api/v1/analytics/sales/cohorts
   */
  async getSalesCohorts(params: GetSalesCohortsParams = {}): Promise<SalesCohortsRes | null> {
    try {
      const queryParams: Record<string, number> = {};
      if (params.months !== undefined) queryParams.months = params.months;

      const response = await apiClient.get<ApiDataWrapper<SalesCohortsRes> | SalesCohortsRes>(
        "/api/v1/analytics/sales/cohorts",
        { params: queryParams }
      );

      const body = response.data;
      if (!body) return null;
      if ("data" in body && body.data) return body.data;
      return body as SalesCohortsRes;
    } catch (err) {
      console.warn("[analyticsService] Error fetching sales cohorts:", err);
      return null;
    }
  },
};
