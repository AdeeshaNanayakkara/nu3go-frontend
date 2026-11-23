import { apiClient } from "@/services/api/client";

export interface CreateReviewReq {
  rating: number; // 1-5
  comment: string; // 10-2000 chars
  title?: string; // max 120 chars
}

export interface UpdateReviewReq {
  rating: number;
  comment: string;
  title?: string;
}

export interface ReviewRes {
  id: string;
  user_id: string;
  reviewer_name: string;
  reviewer_email: string;
  rating: number;
  title?: string;
  comment: string;
  is_published: boolean;
  published_at?: string;
  published_by_user_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface ReviewPaginationMeta {
  has_next?: boolean;
  has_prev?: boolean;
  limit?: number;
  page?: number;
  total_pages?: number;
  total_rows?: number;
}

export interface ListReviewsRes {
  data: ReviewRes[];
  pagination?: ReviewPaginationMeta;
}

export interface ListPublicReviewsRes {
  reviews: ReviewRes[];
  total: number;
}

export interface ReviewSummaryRes {
  average_rating: number;
  total_reviews: number;
  distribution?: Record<string, number>;
}

export interface ListAdminReviewsParams {
  page?: number;
  limit?: number;
  is_published?: boolean;
  rating?: number;
  user_id?: string;
}

function unwrapReview(data: unknown): ReviewRes {
  const d = data as Record<string, unknown> | null;
  if (d && typeof d === "object" && d.data && typeof d.data === "object" && "id" in (d.data as Record<string, unknown>)) {
    return d.data as ReviewRes;
  }
  return data as ReviewRes;
}

export const reviewService = {
  /**
   * Submit a new customer review (POST /api/v1/reviews via BFF)
   * Only customers with an ACTIVE or EXPIRED subscription can submit.
   */
  async submitReview(data: CreateReviewReq): Promise<ReviewRes> {
    const res = await apiClient.post<unknown>("/api/v1/reviews", data, {
      notify: false,
    });
    return unwrapReview(res.data);
  },

  /**
   * Get the current authenticated user's review (GET /api/v1/reviews/me via BFF)
   */
  async getMyReview(): Promise<ReviewRes | null> {
    try {
      const res = await apiClient.get<unknown>("/api/v1/reviews/me", {
        notify: false,
        skipAuthRedirect: true,
      });
      return unwrapReview(res.data);
    } catch {
      return null;
    }
  },

  /**
   * List public approved reviews (GET /api/v1/reviews via BFF)
   */
  async getPublicReviews(params?: {
    page?: number;
    limit?: number;
    rating?: number;
  }): Promise<ListPublicReviewsRes> {
    const res = await apiClient.get<Record<string, unknown>>("/api/v1/reviews", {
      params,
      notify: false,
      skipAuthRedirect: true,
    });

    const body = res.data;
    let reviews: ReviewRes[] = [];
    let total = 0;

    const dataObj = body?.data as Record<string, unknown> | undefined;

    if (dataObj && Array.isArray(dataObj.data)) {
      reviews = dataObj.data as unknown as ReviewRes[];
      const pag = dataObj.pagination as { total_rows?: number } | undefined;
      total = Number(pag?.total_rows ?? reviews.length);
    } else if (dataObj && Array.isArray(dataObj.reviews)) {
      reviews = dataObj.reviews;
      total = Number(dataObj.total ?? reviews.length);
    } else if (Array.isArray(body?.data)) {
      reviews = body.data;
      total = Number(body.total ?? reviews.length);
    } else if (Array.isArray(body?.reviews)) {
      reviews = body.reviews as ReviewRes[];
      total = Number(body.total ?? reviews.length);
    } else if (Array.isArray(body)) {
      reviews = body as ReviewRes[];
      total = reviews.length;
    }

    return { reviews, total };
  },

  /**
   * Admin: List all reviews with filters & pagination (GET /api/v1/reviews?admin=true)
   */
  async getAdminReviews(params?: ListAdminReviewsParams): Promise<ListReviewsRes> {
    const queryParams: Record<string, string | number | boolean> = {
      admin: "true",
      ...(params?.page !== undefined ? { page: params.page } : {}),
      ...(params?.limit !== undefined ? { limit: params.limit } : {}),
      ...(params?.is_published !== undefined ? { is_published: params.is_published } : {}),
      ...(params?.rating !== undefined ? { rating: params.rating } : {}),
      ...(params?.user_id ? { user_id: params.user_id } : {}),
    };

    const res = await apiClient.get<Record<string, unknown>>("/api/v1/reviews", {
      params: queryParams,
      notify: false,
    });

    const body = res.data;
    let items: ReviewRes[] = [];
    let pagination: ReviewPaginationMeta | undefined = undefined;

    const dataObj = body?.data as Record<string, unknown> | undefined;

    if (dataObj && Array.isArray(dataObj.data)) {
      items = dataObj.data as ReviewRes[];
      pagination = dataObj.pagination as ReviewPaginationMeta | undefined;
    } else if (Array.isArray(body?.data)) {
      items = body.data as ReviewRes[];
      pagination = body.pagination as ReviewPaginationMeta | undefined;
    } else if (Array.isArray(body)) {
      items = body as ReviewRes[];
    }

    return { data: items, pagination };
  },

  /**
   * Admin/Public: Aggregate review summary (GET /api/v1/reviews/summary)
   */
  async getReviewSummary(): Promise<ReviewSummaryRes> {
    const res = await apiClient.get<Record<string, unknown>>("/api/v1/reviews/summary", {
      notify: false,
    });
    const body = res.data;
    const dataObj = body?.data as Record<string, unknown> | undefined;

    if (dataObj && typeof dataObj === "object" && "average_rating" in dataObj) {
      return dataObj as unknown as ReviewSummaryRes;
    }
    if (body && typeof body === "object" && "average_rating" in body) {
      return body as unknown as ReviewSummaryRes;
    }
    return { average_rating: 5, total_reviews: 0 };
  },

  /**
   * Admin: Get a review by ID (GET /api/v1/reviews/[id])
   */
  async getReviewDetail(id: string): Promise<ReviewRes> {
    const res = await apiClient.get<unknown>(`/api/v1/reviews/${id}`, {
      notify: false,
    });
    return unwrapReview(res.data);
  },

  /**
   * Admin: Publish or hide a review (PATCH /api/v1/reviews/[id]/visibility)
   */
  async setReviewVisibility(id: string, is_published: boolean): Promise<ReviewRes> {
    const res = await apiClient.patch<unknown>(
      `/api/v1/reviews/${id}/visibility`,
      { is_published },
      { notify: false }
    );
    return unwrapReview(res.data);
  },

  /**
   * Admin: Update review contents (PUT /api/v1/reviews/[id])
   */
  async updateReview(id: string, data: UpdateReviewReq): Promise<ReviewRes> {
    const res = await apiClient.put<unknown>(`/api/v1/reviews/${id}`, data, {
      notify: false,
    });
    return unwrapReview(res.data);
  },

  /**
   * Admin: Delete a review (DELETE /api/v1/reviews/[id])
   */
  async deleteReview(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/reviews/${id}`, {
      notify: false,
    });
  },
};
