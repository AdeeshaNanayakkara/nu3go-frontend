import { apiClient } from "@/services/api/client";
import type { PaginationMeta } from "@/services/api/admin.service";
import { assertApiResponse } from "@/utils/response-handler";

export interface PackagePlanPrice {
  plan_id: string;
  price: number;
  return_price?: number;
}

export interface PublicAssignedPlan {
  plan_id: string;
  name: string;
  type?: "FIXED" | "CUSTOM" | string;
  billing_cycle?: string | null;
  duration_limit: number;
  price: number;
  return_price?: number;
}

export interface ActiveDiscount {
  id?: string;
  name: string;
  percentage: number;
  start_date?: string;
  end_date?: string;
}

export interface PublicPackage {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  active_discount?: ActiveDiscount | null;
  discount?: ActiveDiscount | null;
  plans?: PublicAssignedPlan[];
  menus?: any[];
}

export interface PlanWithPrice {
  plan_id: string;
  name?: string;
  plan_name?: string;
  type?: "FIXED" | "CUSTOM" | string;
  duration_limit?: number;
  duration_days?: number;
  price: number;
  return_price?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionPlanItem {
  id: string;
  name: string;
  type?: string;
  duration_limit?: number;
  duration_days?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PackageItem {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  plans?: PlanWithPrice[];
  assigned_plans?: PlanWithPrice[];
  created_at?: string;
  updated_at?: string;
}

export interface CreatePackagePayload {
  name: string;
  description?: string;
  is_active?: boolean;
  plans: PackagePlanPrice[];
}

export interface UpdatePackagePayload {
  name?: string;
  description?: string;
  is_active?: boolean;
  plans?: PackagePlanPrice[];
}

export interface PaginatedPackagesResponse {
  success: boolean;
  data?: {
    data: PackageItem[];
    pagination: PaginationMeta;
  } | PackageItem[];
  pagination?: PaginationMeta;
  error?: {
    code?: number;
    details?: string;
    message?: string;
  };
}

export interface GetPackagesParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}

export interface GetPackagesResult {
  packages: PackageItem[];
  pagination: PaginationMeta;
}

export const packageService = {
  /**
   * Fetch paginated packages list via BFF /api/admin/packages
   */
  async getPackages(params: GetPackagesParams = {}, config?: { skipAuthRedirect?: boolean }): Promise<GetPackagesResult> {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.limit !== undefined) queryParams.limit = params.limit;
    if (params.search) queryParams.search = params.search;
    if (params.is_active !== undefined) queryParams.is_active = params.is_active;

    const response = await apiClient.get<PaginatedPackagesResponse | PackageItem[]>("/api/admin/packages", {
      params: queryParams,
      skipAuthRedirect: config?.skipAuthRedirect,
    });

    const resBody = response.data;

    const defaultPagination: PaginationMeta = {
      has_next: false,
      has_prev: false,
      limit: params.limit || 12,
      page: params.page || 1,
      total_pages: 1,
      total_rows: 0,
    };

    if (resBody && typeof resBody === "object" && "data" in resBody) {
      const d = (resBody as any).data;
      if (Array.isArray(d)) {
        return {
          packages: d,
          pagination: (resBody as any).pagination || {
            ...defaultPagination,
            total_rows: d.length,
          },
        };
      }
      if (d && typeof d === "object" && "data" in d && Array.isArray(d.data)) {
        return {
          packages: d.data,
          pagination: d.pagination || {
            ...defaultPagination,
            total_rows: d.data.length,
          },
        };
      }
    }

    if (Array.isArray(resBody)) {
      return {
        packages: resBody,
        pagination: {
          ...defaultPagination,
          total_rows: resBody.length,
        },
      };
    }

    return {
      packages: [],
      pagination: defaultPagination,
    };
  },

  /**
   * Create a new meal package
   */
  async createPackage(data: CreatePackagePayload): Promise<PackageItem> {
    const payload = {
      name: data.name,
      description: data.description || "",
      is_active: data.is_active ?? false,
      plans: (data.plans || []).map((p) => ({
        plan_id: p.plan_id,
        price: Number(p.price),
        return_price: Number(p.return_price ?? 0),
      })),
    };

    const response = await apiClient.post<PackageItem>("/api/admin/packages", payload);
    return assertApiResponse<PackageItem>(response, "Unable to create package. Please check package details.");
  },

  /**
   * Update an existing package by ID
   */
  async updatePackage(id: string, data: UpdatePackagePayload): Promise<PackageItem> {
    const response = await apiClient.put<PackageItem>(`/api/admin/packages/${id}`, data);
    return assertApiResponse<PackageItem>(response, "Unable to update package. Please check details.");
  },

  /**
   * Soft delete a package by ID
   */
  async deletePackage(id: string): Promise<void> {
    const response = await apiClient.delete<void>(`/api/admin/packages/${id}`);
    assertApiResponse<void>(response, "Unable to delete package.");
  },

  /**
   * Get assigned plans for a package
   */
  async getAssignedPlans(packageId: string): Promise<PlanWithPrice[]> {
    const response = await apiClient.get<{
      success?: boolean;
      data?: PlanWithPrice[] | { data?: PlanWithPrice[] };
    }>(`/api/admin/packages/${packageId}/plans`);

    if (response.status >= 400) {
      console.warn(`[getAssignedPlans] HTTP ${response.status} fetching plans for package ${packageId}`);
      return [];
    }

    const resBody = response.data;
    if (!resBody) return [];

    if (Array.isArray(resBody)) return resBody;

    if (typeof resBody === "object" && "data" in resBody) {
      const d = (resBody as any).data;
      if (Array.isArray(d)) return d;
      if (d && typeof d === "object" && "data" in d && Array.isArray(d.data)) {
        return d.data;
      }
    }

    return [];
  },

  /**
   * Assign subscription plans to a package
   */
  async assignPlans(packageId: string, plans: PackagePlanPrice[]): Promise<void> {
    const formattedPlans = plans.map((p) => ({
      plan_id: p.plan_id,
      price: Number(p.price),
      return_price: Number(p.return_price ?? 0),
    }));

    const response = await apiClient.post<void>(`/api/admin/packages/${packageId}/plans`, {
      plans: formattedPlans,
    });
    assertApiResponse<void>(response, "Unable to assign plan to package.");
  },

  /**
   * Helper alias to assign a single plan to a package
   */
  async assignPlanToPackage(
    packageId: string,
    planId: string,
    price: number,
    returnPrice: number = 0
  ): Promise<void> {
    await this.assignPlans(packageId, [{ plan_id: planId, price, return_price: returnPrice }]);
  },

  /**
   * Unassign a subscription plan from a package
   */
  async unassignPlan(packageId: string, planId: string): Promise<void> {
    const response = await apiClient.delete<void>(`/api/admin/packages/${packageId}/plans/${planId}`);
    assertApiResponse<void>(response, "Unable to unassign plan from package.");
  },

  /**
   * Helper alias to unassign a plan from a package
   */
  async unassignPlanFromPackage(packageId: string, planId: string): Promise<void> {
    await this.unassignPlan(packageId, planId);
  },

  /**
   * Update price and return_price for a plan assigned to a package
   */
  async updatePlanPrice(
    packageId: string,
    planId: string,
    price: number,
    returnPrice?: number
  ): Promise<void> {
    const response = await apiClient.put<void>(`/api/admin/packages/${packageId}/plans/${planId}/price`, {
      price: Number(price),
      return_price: Number(returnPrice ?? 0),
    });
    assertApiResponse<void>(response, "Unable to update plan price.");
  },

  /**
   * Fetch system-wide subscription plans available for assigning
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlanItem[]> {
    const response = await apiClient.get<{
      success?: boolean;
      data?: { data: SubscriptionPlanItem[] } | SubscriptionPlanItem[];
    }>("/api/admin/subscription-plans");

    const resBody = response.data;
    if (resBody && typeof resBody === "object" && "data" in resBody) {
      const d = (resBody as any).data;
      if (Array.isArray(d)) return d;
      if (d && typeof d === "object" && "data" in d && Array.isArray(d.data)) {
        return d.data;
      }
    }
    if (Array.isArray(resBody)) return resBody as SubscriptionPlanItem[];
    return [];
  },

  /**
   * Fetch active public packages with assigned plans
   */
  async getPublicPackages(): Promise<PublicPackage[]> {
    try {
      const response = await apiClient.get<{
        success?: boolean;
        data?: PublicPackage[] | { data?: PublicPackage[] };
      }>("/api/public/packages", { skipAuthRedirect: true });

      const resBody = response.data;
      if (resBody && typeof resBody === "object" && "data" in resBody) {
        const d = (resBody as any).data;
        if (Array.isArray(d)) return d;
        if (d && typeof d === "object" && "data" in d && Array.isArray(d.data)) return d.data;
      }
      if (Array.isArray(resBody)) return resBody;
    } catch (err) {
      console.warn("Could not fetch public packages:", err);
    }
    return [];
  },

  /**
   * Fetch details of a single public package by ID (with plans and menus)
   */
  async getPublicPackageDetail(id: string): Promise<PublicPackage | null> {
    try {
      const response = await apiClient.get<{
        success?: boolean;
        data?: PublicPackage;
      }>(`/api/public/packages/${id}`, { skipAuthRedirect: true });

      const resBody = response.data;
      if (resBody && typeof resBody === "object" && "data" in resBody) {
        return (resBody as any).data || null;
      }
      return resBody as unknown as PublicPackage;
    } catch (err) {
      console.warn(`Could not fetch public package detail for ${id}:`, err);
      return null;
    }
  },

  /**
   * Fetch active catalog packages with plans from database
   */
  async getCatalogPackages(): Promise<PackageItem[]> {
    try {
      const response = await apiClient.get<{ success?: boolean; data?: PackageItem[] | { data?: PackageItem[] } }>(
        "/api/public/packages",
        { skipAuthRedirect: true }
      );
      const resBody = response.data;
      if (resBody && typeof resBody === "object" && "data" in resBody) {
        const d = (resBody as any).data;
        if (Array.isArray(d)) return d;
        if (d && typeof d === "object" && "data" in d && Array.isArray(d.data)) return d.data;
      }
      if (Array.isArray(resBody)) return resBody;
    } catch {
      try {
        const result = await this.getPackages({ is_active: true }, { skipAuthRedirect: true });
        return result.packages;
      } catch (err) {
        console.warn("Could not fetch database catalog packages (using static fallback):", err);
      }
    }
    return [];
  },
};
