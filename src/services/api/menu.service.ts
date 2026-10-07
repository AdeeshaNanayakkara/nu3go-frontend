import { apiClient } from "@/services/api/client";
import { assertApiResponse } from "@/utils/response-handler";

export type MenuDay = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";

export interface MenuMealSlot {
  day: MenuDay;
  meal_id: string; // Mandatory main meal
  optional_meal_id?: string; // Optional meal
  emergency_meal_change_id?: string; // Backup for main meal
  emergency_optional_meal_change_id?: string; // Backup for optional meal
}

export interface CreateMenuPayload {
  package_id: string;
  name: string;
  sequence?: number;
  meals: MenuMealSlot[];
}

export interface UpdateMenuPayload {
  package_id?: string;
  name?: string;
  sequence?: number;
  meals?: MenuMealSlot[];
}

export interface MenuItem {
  id: string;
  package_id: string;
  name: string;
  sequence?: number;
  meals?: MenuMealSlot[];
  created_at?: string;
  updated_at?: string;
}

export const menuService = {
  /**
   * Fetch menus list (optionally filtered by package_id)
   */
  async getMenus(packageId?: string): Promise<MenuItem[]> {
    const params: Record<string, string> = {};
    if (packageId) params.package_id = packageId;

    const response = await apiClient.get<{ success?: boolean; data?: MenuItem[] | { data?: MenuItem[] } }>(
      "/api/admin/menus",
      { params }
    );

    if (response.status >= 400) {
      console.warn(`[getMenus] HTTP ${response.status} fetching menus for package ${packageId}`);
      return [];
    }

    const sortMenus = (list: MenuItem[]): MenuItem[] => {
      return [...list].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
    };

    const resBody = response.data;
    if (resBody && typeof resBody === "object" && "data" in resBody) {
      const d = (resBody as any).data;
      if (Array.isArray(d)) return sortMenus(d);
      if (d && typeof d === "object" && "data" in d && Array.isArray(d.data)) {
        return sortMenus(d.data);
      }
    }
    if (Array.isArray(resBody)) return sortMenus(resBody as MenuItem[]);
    return [];
  },

  /**
   * Fetch single menu details by ID
   */
  async getMenuById(id: string): Promise<MenuItem> {
    const response = await apiClient.get<MenuItem>(`/api/admin/menus/${id}`);
    return assertApiResponse<MenuItem>(response, "Unable to load menu details.");
  },

  /**
   * Create a new menu
   */
  async createMenu(payload: CreateMenuPayload): Promise<MenuItem> {
    const response = await apiClient.post<MenuItem>("/api/admin/menus", payload);
    return assertApiResponse<MenuItem>(response, "Unable to create menu. Please check meal selections.");
  },

  /**
   * Update an existing menu by ID
   */
  async updateMenu(id: string, payload: UpdateMenuPayload): Promise<MenuItem> {
    const response = await apiClient.put<MenuItem>(`/api/admin/menus/${id}`, payload);
    return assertApiResponse<MenuItem>(response, "Unable to update menu. Please check meal selections.");
  },

  /**
   * Delete a menu by ID
   */
  async deleteMenu(id: string): Promise<void> {
    const response = await apiClient.delete<void>(`/api/admin/menus/${id}`);
    assertApiResponse<void>(response, "Unable to delete menu.");
  },
};
