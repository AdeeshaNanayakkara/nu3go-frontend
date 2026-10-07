import { apiClient } from "@/services/api/client";

export interface AdminUserItem {
  id: string;
  email: string;
  role?: string;
  google_id?: string | null;
  is_active?: boolean;
  is_verified?: boolean;
  profile_picture_url?: string | null;
  created_at?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
}

export interface PaginationMeta {
  has_next: boolean;
  has_prev: boolean;
  limit: number;
  page: number;
  total_pages: number;
  total_rows: number;
}

export interface PaginatedUsersResponse {
  success: boolean;
  data?: {
    data: AdminUserItem[];
    pagination: PaginationMeta;
  };
  error?: {
    code: number;
    details: string;
    message: string;
  };
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetUsersResult {
  users: AdminUserItem[];
  pagination: PaginationMeta;
}

export const adminService = {
  /**
   * Fetch paginated system users via BFF /api/admin/users -> backend /api/v1/users?page=X&limit=Y
   */
  async getUsers(params: GetUsersParams = {}): Promise<GetUsersResult> {
    const queryParams: Record<string, string | number> = {};
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.limit !== undefined) queryParams.limit = params.limit;
    if (params.search) queryParams.search = params.search;

    const response = await apiClient.get<PaginatedUsersResponse | AdminUserItem[]>("/api/admin/users", {
      params: queryParams,
    });

    const resBody = response.data;

    const defaultPagination: PaginationMeta = {
      has_next: false,
      has_prev: false,
      limit: params.limit || 10,
      page: params.page || 1,
      total_pages: 1,
      total_rows: 0,
    };

    // Standard backend envelope: { success: true, data: { data: [...], pagination: {...} } }
    if (resBody && typeof resBody === "object" && "data" in resBody) {
      const nested = (resBody as PaginatedUsersResponse).data;
      if (nested && typeof nested === "object" && "data" in nested && Array.isArray(nested.data)) {
        return {
          users: nested.data,
          pagination: nested.pagination || {
            ...defaultPagination,
            total_rows: nested.data.length,
          },
        };
      }
    }

    // Direct array fallback
    if (Array.isArray(resBody)) {
      return {
        users: resBody,
        pagination: {
          ...defaultPagination,
          total_rows: resBody.length,
        },
      };
    }

    return {
      users: [],
      pagination: defaultPagination,
    };
  },

  /**
   * Update user status (Active vs Suspended/Inactive) via BFF /api/admin/users/[id]/status
   */
  async updateUserStatus(id: string, isActive: boolean): Promise<AdminUserItem> {
    const response = await apiClient.put<AdminUserItem>(`/api/admin/users/${id}/status`, {
      is_active: isActive,
      status: isActive ? "ACTIVE" : "SUSPENDED",
    });

    if (response.status >= 400) {
      const errMsg = (response.data as any)?.error?.message || (response.data as any)?.message || `Failed to update user status (HTTP ${response.status})`;
      throw new Error(errMsg);
    }

    const resBody = response.data;
    if (resBody && typeof resBody === "object" && "data" in resBody && (resBody as any).data) {
      return (resBody as any).data as AdminUserItem;
    }
    return (resBody || { id, email: "", is_active: isActive }) as AdminUserItem;
  },
};
