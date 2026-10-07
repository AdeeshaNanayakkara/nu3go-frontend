import { apiClient } from "@/services/api/client";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateFAQPayload {
  question: string;
  answer: string;
  is_active: boolean;
  display_order?: number;
}

export interface UpdateFAQPayload {
  question?: string;
  answer?: string;
  is_active?: boolean;
  display_order?: number;
}

export interface FAQApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: {
    code?: number;
    details?: string;
    message?: string;
  };
}

export const DEFAULT_FAQS: FAQItem[] = [
  {
    id: "faq-1",
    question: "How does the daily meal subscription work?",
    answer:
      "We prepare chef-crafted, macro-calculated healthy meals fresh every weekday morning. Your meal is packaged in insulated containers and delivered straight to your doorstep before your chosen delivery slot.",
    display_order: 1,
    is_active: true,
  },
  {
    id: "faq-2",
    question: "What is the difference between Power Meal and Classic Meal?",
    answer:
      "Power Meals are high-protein macro fuels (40g+ protein) tailored for fitness enthusiasts and athletes. Classic Meals provide wholesome, nutrient-dense everyday wellness with organic balance and fresh farm veggies.",
    display_order: 2,
    is_active: true,
  },
  {
    id: "faq-3",
    question: "Can I pause, skip, or cancel my subscription anytime?",
    answer:
      "Yes! You have complete flexibility. You can pause or skip upcoming delivery days from your Customer Dashboard before 5:00 PM on the previous day. Missed meals are automatically credited to your account balance.",
    display_order: 3,
    is_active: true,
  },
  {
    id: "faq-4",
    question: "What delivery locations and zones do you cover?",
    answer:
      "We deliver across Colombo 01-15, Nawala, Rajagiriya, Battaramulla, Nugegoda, Dehiwala, Mount Lavinia, and surrounding major metropolitan areas with free doorstep delivery.",
    display_order: 4,
    is_active: true,
  },
  {
    id: "faq-5",
    question: "How are the meals packaged and kept fresh?",
    answer:
      "Every meal is sealed in food-grade, eco-friendly, microwave-safe containers delivered warm or chill-sealed to preserve peak nutrition, crispness, and fresh flavor.",
    display_order: 5,
    is_active: true,
  },
  {
    id: "faq-6",
    question: "What payment methods are supported?",
    answer:
      "We support secure online payments via PayHere (Visa, MasterCard, Amex), direct bank transfer, and automated recurring billing for seamless weekly/monthly renewals.",
    display_order: 6,
    is_active: true,
  },
];

export const faqService = {
  /**
   * Fetch all active FAQs using public endpoint /public/faqs (with fallback to default curated FAQs)
   */
  async getPublicFaqs(): Promise<FAQItem[]> {
    try {
      // 1. Try public BFF /api/public/faqs route
      const response = await apiClient.get<FAQApiResponse<FAQItem[]> | FAQItem[]>("/api/public/faqs", {
        skipAuthRedirect: true,
      });
      const resBody = response.data;

      let items: FAQItem[] | null = null;
      if (Array.isArray(resBody) && resBody.length > 0) {
        items = resBody;
      } else if (
        resBody &&
        typeof resBody === "object" &&
        "data" in resBody &&
        Array.isArray(resBody.data) &&
        resBody.data.length > 0
      ) {
        items = resBody.data;
      }

      if (items && items.length > 0) {
        // Sort by display_order ascending if present
        return [...items].sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
      }
    } catch {
      // Try next fallback
    }

    try {
      // 2. Try legacy public /api/faqs route
      const response = await apiClient.get<FAQApiResponse<FAQItem[]> | FAQItem[]>("/api/faqs", {
        skipAuthRedirect: true,
      });
      const resBody = response.data;

      let items: FAQItem[] | null = null;
      if (Array.isArray(resBody) && resBody.length > 0) {
        items = resBody;
      } else if (
        resBody &&
        typeof resBody === "object" &&
        "data" in resBody &&
        Array.isArray(resBody.data) &&
        resBody.data.length > 0
      ) {
        items = resBody.data;
      }

      if (items && items.length > 0) {
        return [...items].sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
      }
    } catch {
      // Fallback to default curated FAQs
    }

    return DEFAULT_FAQS;
  },

  /**
   * Fetch all FAQs (public endpoint first, with fallback to admin/defaults)
   */
  async getFaqs(config?: { skipAuthRedirect?: boolean }): Promise<FAQItem[]> {
    try {
      // 1. Try public endpoint first
      const publicItems = await this.getPublicFaqs();
      if (publicItems && publicItems.length > 0 && publicItems !== DEFAULT_FAQS) {
        return publicItems;
      }
    } catch {
      // Try next
    }

    try {
      // 2. Try admin route if available (for admin dashboard)
      const response = await apiClient.get<FAQApiResponse<FAQItem[]> | FAQItem[]>("/api/admin/faqs", {
        skipAuthRedirect: config?.skipAuthRedirect ?? true,
      });
      const resBody = response.data;

      if (Array.isArray(resBody) && resBody.length > 0) {
        return [...resBody].sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
      }
      if (
        resBody &&
        typeof resBody === "object" &&
        "data" in resBody &&
        Array.isArray(resBody.data) &&
        resBody.data.length > 0
      ) {
        return [...resBody.data].sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
      }
    } catch {
      // Fallback to default curated FAQs
    }

    return DEFAULT_FAQS;
  },

  /**
   * Create a new FAQ
   */
  async createFaq(data: CreateFAQPayload): Promise<FAQItem> {
    const response = await apiClient.post<FAQApiResponse<FAQItem>>("/api/admin/faqs", data);
    const resBody = response.data;
    if (resBody && typeof resBody === "object" && "data" in resBody && resBody.data) {
      return resBody.data;
    }
    return resBody as unknown as FAQItem;
  },

  /**
   * Update an existing FAQ by ID
   */
  async updateFaq(id: string, data: UpdateFAQPayload): Promise<FAQItem> {
    const response = await apiClient.put<FAQApiResponse<FAQItem>>(`/api/admin/faqs/${id}`, data);
    const resBody = response.data;
    if (resBody && typeof resBody === "object" && "data" in resBody && resBody.data) {
      return resBody.data;
    }
    return resBody as unknown as FAQItem;
  },

  /**
   * Delete an FAQ by ID
   */
  async deleteFaq(id: string): Promise<void> {
    await apiClient.delete(`/api/admin/faqs/${id}`);
  },
};
