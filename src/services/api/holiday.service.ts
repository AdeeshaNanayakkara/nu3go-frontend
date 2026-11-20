import { apiClient } from "@/services/api/client";

export type HolidayStatus = "DRAFT" | "PUBLISHED" | string;

export interface HolidayRes {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  description?: string;
  status: HolidayStatus;
  weekday?: string;
  processing_status?: string;
  created_at?: string;
  created_by_id?: string;
  published_at?: string;
  published_by_id?: string;
  updated_at?: string;
}

export interface HolidayPaginationMeta {
  has_next?: boolean;
  has_prev?: boolean;
  limit?: number;
  page?: number;
  total_pages?: number;
  total_rows?: number;
}

export interface ListHolidaysRes {
  data: HolidayRes[];
  pagination?: HolidayPaginationMeta;
}

export interface HolidayInput {
  date: string; // YYYY-MM-DD
  name: string;
  description?: string;
}

export interface UpdateHolidayReq {
  date?: string;
  name?: string;
  description?: string;
}

export interface ListHolidaysParams {
  page?: number;
  limit?: number;
  status?: "DRAFT" | "PUBLISHED";
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
}

function toError(err: any, fallback: string): Error {
  const msg = err?.message || err?.error?.message || fallback;
  const customErr = new Error(msg);
  (customErr as any).status = err?.status;
  return customErr;
}

export const holidayService = {
  /**
   * Admin: List draft & published holidays ordered by date
   * GET /api/v1/holidays
   */
  async listHolidays(params: ListHolidaysParams = {}): Promise<ListHolidaysRes> {
    try {
      const response = await apiClient.get<any>("/api/v1/holidays", {
        params: params as Record<string, string | number | undefined>,
      });
      const body = response.data;
      if (body && body.data && Array.isArray(body.data.data)) {
        return body.data as ListHolidaysRes;
      }
      if (body && Array.isArray(body.data)) {
        return body as ListHolidaysRes;
      }
      return { data: [] };
    } catch (err: any) {
      throw toError(err, "Failed to load holidays");
    }
  },

  /**
   * Admin: Create one or more draft holidays
   * POST /api/v1/holidays
   */
  async createHolidays(holidays: HolidayInput[]): Promise<HolidayRes[]> {
    try {
      const response = await apiClient.post<any>("/api/v1/holidays", { holidays });
      const body = response.data;
      if (body && Array.isArray(body.data)) return body.data as HolidayRes[];
      return [];
    } catch (err: any) {
      throw toError(err, "Failed to create holiday");
    }
  },

  /**
   * Admin: Update a draft holiday
   * PATCH /api/v1/holidays/{id}
   */
  async updateHoliday(id: string, payload: UpdateHolidayReq): Promise<HolidayRes | null> {
    try {
      const response = await apiClient.patch<any>(`/api/v1/holidays/${id}`, payload);
      const body = response.data;
      if (body && body.data) return body.data as HolidayRes;
      return body as HolidayRes;
    } catch (err: any) {
      throw toError(err, "Failed to update holiday");
    }
  },

  /**
   * Admin: Delete a draft holiday (published returns 409)
   * DELETE /api/v1/holidays/{id}
   */
  async deleteHoliday(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<any>(`/api/v1/holidays/${id}`);
      return response.status === 200 || response.status === 204;
    } catch (err: any) {
      throw toError(err, "Failed to delete holiday");
    }
  },

  /**
   * Admin: Publish draft holidays permanently
   * POST /api/v1/holidays/publications
   */
  async publishHolidays(holidayIds: string[]): Promise<unknown> {
    try {
      const response = await apiClient.post<any>("/api/v1/holidays/publications", {
        holiday_ids: holidayIds,
      });
      const body = response.data;
      return body?.data ?? body;
    } catch (err: any) {
      throw toError(err, "Failed to publish holidays");
    }
  },
};
