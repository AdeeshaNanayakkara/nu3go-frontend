import { apiClient } from "@/services/api/client";

export interface Discount {
  id: string;
  name: string;
  percentage: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDiscountPayload {
  name: string;
  percentage: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  package_ids: string[];
}

export interface UpdateDiscountPayload {
  name?: string;
  percentage?: number;
  start_date?: string;
  end_date?: string;
}

export interface AssignedPackage {
  package_id: string;
}

export interface MealPackage {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface GetDiscountsParams {
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface DiscountApiResponse<T> {
  success?: boolean;
  data?: T | { data: T; pagination?: unknown };
  error?: {
    code?: number;
    details?: string;
    message?: string;
  };
}

export const discountService = {
  /**
   * Fetch all discounts with optional filtering
   */
  async getDiscounts(params?: GetDiscountsParams): Promise<Discount[]> {
    const response = await apiClient.get<
      DiscountApiResponse<Discount[]> | Discount[]
    >("/api/admin/discounts", {
      params: params as Record<string, string | number | boolean | undefined>,
    });

    const resBody = response.data;

    if (Array.isArray(resBody)) return resBody;
    if (resBody && typeof resBody === "object") {
      if ("data" in resBody && resBody.data) {
        const payloadData = resBody.data;
        if (Array.isArray(payloadData)) {
          return payloadData;
        }
        if (
          typeof payloadData === "object" &&
          "data" in payloadData &&
          Array.isArray((payloadData as { data: Discount[] }).data)
        ) {
          return (payloadData as { data: Discount[] }).data;
        }
      }
    }
    return [];
  },

  /**
   * Fetch discount details by ID
   */
  async getDiscountById(id: string): Promise<Discount> {
    const response = await apiClient.get<DiscountApiResponse<Discount>>(
      `/api/admin/discounts/${id}`
    );
    const resBody = response.data;
    if (resBody && typeof resBody === "object" && "data" in resBody && resBody.data) {
      return resBody.data as Discount;
    }
    return resBody as unknown as Discount;
  },

  /**
   * Create a new discount (defaults to is_active: true)
   */
  async createDiscount(payload: CreateDiscountPayload): Promise<Discount> {
    const response = await apiClient.post<DiscountApiResponse<Discount>>(
      "/api/admin/discounts",
      {
        ...payload,
        is_active: payload.is_active ?? true,
      }
    );
    const resBody = response.data;
    if (resBody && typeof resBody === "object" && "data" in resBody && resBody.data) {
      return resBody.data as Discount;
    }
    return resBody as unknown as Discount;
  },

  /**
   * Update existing discount by ID
   */
  async updateDiscount(
    id: string,
    payload: UpdateDiscountPayload
  ): Promise<Discount> {
    const response = await apiClient.put<DiscountApiResponse<Discount>>(
      `/api/admin/discounts/${id}`,
      payload
    );
    const resBody = response.data;
    if (resBody && typeof resBody === "object" && "data" in resBody && resBody.data) {
      return resBody.data as Discount;
    }
    return resBody as unknown as Discount;
  },

  /**
   * Delete discount by ID
   */
  async deleteDiscount(id: string): Promise<void> {
    await apiClient.delete(`/api/admin/discounts/${id}`);
  },

  /**
   * Toggle active / inactive status of a discount
   */
  async updateDiscountStatus(id: string, is_active: boolean): Promise<void> {
    await apiClient.patch(`/api/admin/discounts/${id}/status`, {
      is_active,
    });
  },

  /**
   * Fetch assigned packages for a discount
   */
  async getAssignedPackages(id: string): Promise<AssignedPackage[]> {
    const response = await apiClient.get<
      DiscountApiResponse<AssignedPackage[]> | AssignedPackage[]
    >(`/api/admin/discounts/${id}/packages`);

    const resBody = response.data;
    if (Array.isArray(resBody)) return resBody;
    if (resBody && typeof resBody === "object" && "data" in resBody && Array.isArray(resBody.data)) {
      return resBody.data;
    }
    return [];
  },

  /**
   * Assign package(s) to a discount
   */
  async assignPackages(id: string, package_ids: string[]): Promise<void> {
    await apiClient.post(`/api/admin/discounts/${id}/packages`, {
      package_ids,
    });
  },

  /**
   * Unassign a package from a discount
   */
  async unassignPackage(id: string, packageId: string): Promise<void> {
    await apiClient.delete(`/api/admin/discounts/${id}/packages/${packageId}`);
  },

  /**
   * Fetch all available meal packages (for multi-selection)
   */
  async getAvailablePackages(): Promise<MealPackage[]> {
    const response = await apiClient.get<
      DiscountApiResponse<MealPackage[]> | MealPackage[]
    >("/api/admin/packages");

    const resBody = response.data;
    if (Array.isArray(resBody)) return resBody;
    if (resBody && typeof resBody === "object") {
      if ("data" in resBody && resBody.data) {
        const payloadData = resBody.data;
        if (Array.isArray(payloadData)) {
          return payloadData;
        }
        if (
          typeof payloadData === "object" &&
          "data" in payloadData &&
          Array.isArray((payloadData as { data: MealPackage[] }).data)
        ) {
          return (payloadData as { data: MealPackage[] }).data;
        }
      }
    }
    return [];
  },
};
