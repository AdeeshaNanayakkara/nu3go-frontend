import { apiClient } from "@/services/api/client";
import type { PaginationMeta } from "@/services/api/admin.service";
import { compressImagePreserveDimensions } from "@/utils/image-compression";

export interface MealItem {
  id: string;
  name: string;
  description: string;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMealPayload {
  name: string;
  description?: string;
  image_url?: string;
}

export interface UpdateMealPayload {
  name?: string;
  description?: string;
  image_url?: string;
}

export interface PaginatedMealsResponse {
  success: boolean;
  data?: {
    data: MealItem[];
    pagination: PaginationMeta;
  };
  error?: {
    code?: number;
    details?: string;
    message?: string;
  };
}

export interface GetMealsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetMealsResult {
  meals: MealItem[];
  pagination: PaginationMeta;
}

export const mealService = {
  /**
   * Fetch paginated meals list via BFF /api/admin/meals
   */
  async getMeals(params: GetMealsParams = {}): Promise<GetMealsResult> {
    const queryParams: Record<string, string | number> = {};
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.limit !== undefined) queryParams.limit = params.limit;
    if (params.search) queryParams.search = params.search;

    const response = await apiClient.get<PaginatedMealsResponse | MealItem[]>("/api/admin/meals", {
      params: queryParams,
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
      const nested = (resBody as PaginatedMealsResponse).data;
      if (nested && typeof nested === "object" && "data" in nested && Array.isArray(nested.data)) {
        return {
          meals: nested.data,
          pagination: nested.pagination || {
            ...defaultPagination,
            total_rows: nested.data.length,
          },
        };
      }
    }

    if (Array.isArray(resBody)) {
      return {
        meals: resBody,
        pagination: {
          ...defaultPagination,
          total_rows: resBody.length,
        },
      };
    }

    return {
      meals: [],
      pagination: defaultPagination,
    };
  },

  /**
   * Create a new meal
   */
  async createMeal(data: CreateMealPayload): Promise<MealItem> {
    const response = await apiClient.post<{ success: boolean; data: MealItem }>("/api/admin/meals", data);
    const resBody = response.data;
    if (resBody && typeof resBody === "object" && "data" in resBody && resBody.data) {
      return resBody.data;
    }
    return resBody as unknown as MealItem;
  },

  /**
   * Update an existing meal by ID
   */
  async updateMeal(id: string, data: UpdateMealPayload): Promise<MealItem> {
    const response = await apiClient.put<{ success: boolean; data: MealItem }>(`/api/admin/meals/${id}`, data);
    const resBody = response.data;
    if (resBody && typeof resBody === "object" && "data" in resBody && resBody.data) {
      return resBody.data;
    }
    return resBody as unknown as MealItem;
  },

  /**
   * Soft delete a meal by ID
   */
  async deleteMeal(id: string): Promise<void> {
    await apiClient.delete(`/api/admin/meals/${id}`);
  },

  /**
   * Upload meal image via BFF POST /api/admin/images/upload/meal
   * Returns uploaded public image URL.
   */
  async uploadMealImage(file: File): Promise<string> {
    // Compress image quality preserving 100% of original width & height
    const processedFile = await compressImagePreserveDimensions(file);

    const formData = new FormData();
    formData.append("image", processedFile);

    const res = await fetch("/api/admin/images/upload/meal", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to upload meal image.");
    }

    const url = data?.data?.url || data?.data?.image_url || data?.url;
    if (!url) {
      throw new Error("Image upload succeeded but no URL was returned.");
    }

    return url;
  },

  /**
   * Fetch meals that are not assigned to any menu
   */
  async getUnassignedMeals(): Promise<MealItem[]> {
    const response = await apiClient.get<{ success: boolean; data: MealItem[] }>("/api/admin/menus/meals/unassigned");
    const resBody = response.data;
    if (resBody && typeof resBody === "object" && "data" in resBody && Array.isArray(resBody.data)) {
      return resBody.data;
    }
    if (Array.isArray(resBody)) {
      return resBody;
    }
    return [];
  },

  /**
   * Fetch meals assigned to a specific package
   */
  async getMealsByPackageId(packageId: string, menuId?: string): Promise<MealItem[]> {
    const queryParams: Record<string, string> = {};
    if (menuId) queryParams.menu_id = menuId;

    const response = await apiClient.get<{ success: boolean; data: MealItem[] }>(
      `/api/admin/menus/packages/${packageId}/meals`,
      { params: queryParams }
    );
    const resBody = response.data;
    if (resBody && typeof resBody === "object" && "data" in resBody && Array.isArray(resBody.data)) {
      return resBody.data;
    }
    if (Array.isArray(resBody)) {
      return resBody;
    }
    return [];
  },
};
