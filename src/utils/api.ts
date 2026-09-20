const API_BASE_URL =
  (import.meta.env as any).VITE_API_URL ||
  "http://localhost:3001";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  params?: Record<string, string | number | boolean>;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { method = "GET", body, params } = options;

    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }

    const token = sessionStorage.getItem("medikiosk_access_token");

    const headers: Record<string, string> = { ...this.defaultHeaders };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && data.error?.includes("expired")) {
          const refreshed = await this.refreshToken();
          if (refreshed.success) {
            return this.request<T>(endpoint, options);
          }
        }
        return {
          success: false,
          error: data.error || "Request failed",
        };
      }

      return { success: true, data: data.data };
    } catch (error: any) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      return {
        success: false,
        error: error.message || "Network error",
      };
    }
  }


  async login(role: string, username: string, password: string): Promise<ApiResponse<any>> {
    const res = await this.request<{ accessToken: string; refreshToken: string }>("/auth/login", {
      method: "POST",
      body: { role, username, password },
    });

    if (res.success && res.data) {
      sessionStorage.setItem("medikiosk_access_token", res.data.accessToken);
      sessionStorage.setItem("medikiosk_refresh_token", res.data.refreshToken);
    }

    return res;
  }

  async logout(): Promise<ApiResponse<void>> {
    sessionStorage.removeItem("medikiosk_access_token");
    sessionStorage.removeItem("medikiosk_refresh_token");
    sessionStorage.removeItem("medikiosk_auth_user");

    return { success: true };
  }

  private async refreshToken(): Promise<ApiResponse<any>> {
    const refreshToken = sessionStorage.getItem("medikiosk_refresh_token");
    if (!refreshToken) return { success: false, error: "No refresh token" };

    const res = await this.request<{ accessToken: string }>("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });

    if (res.success && res.data) {
      sessionStorage.setItem("medikiosk_access_token", res.data.accessToken);
    }

    return res;
  }


  async initSession(language: string = "English"): Promise<ApiResponse<any>> {
    return this.request("/kiosk/session", {
      method: "POST",
      body: { language },
    });
  }

  async updateSession(data: any): Promise<ApiResponse<any>> {
    return this.request("/kiosk/session", {
      method: "PATCH",
      body: data,
    });
  }

  async recordConsent(sessionId: string, agreed: boolean, categories: string[]): Promise<ApiResponse<any>> {
    return this.request("/kiosk/consent", {
      method: "POST",
      body: { sessionId, agreed, categories },
    });
  }

  async fetchRecords(authMethod: string): Promise<ApiResponse<any>> {
    return this.request("/kiosk/records", {
      method: "POST",
      body: { authMethod },
    });
  }

  async processOCR(docType: string, imageData?: string): Promise<ApiResponse<any>> {
    return this.request("/kiosk/ocr", {
      method: "POST",
      body: { docType, imageData },
    });
  }

  async computeTriage(data: any): Promise<ApiResponse<any>> {
    return this.request("/kiosk/triage", {
      method: "POST",
      body: data,
    });
  }

  async logVoiceCommand(transcript: string, route: string): Promise<ApiResponse<any>> {
    return this.request("/kiosk/voice/log", {
      method: "POST",
      body: { transcript, route },
    });
  }

  async getPatientSummary(patientId: string): Promise<ApiResponse<any>> {
    return this.request("/kiosk/summary", {
      method: "GET",
      params: { patientId },
    });
  }


  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.request("/physician/dashboard/stats");
  }

  async getQueue(type: "red" | "white" | "all" = "all"): Promise<ApiResponse<any>> {
    return this.request(`/physician/queue/${type}`);
  }

  async getPatientDetail(patientId: string): Promise<ApiResponse<any>> {
    return this.request(`/physician/patient/${patientId}`);
  }

  async createEncounter(data: any): Promise<ApiResponse<any>> {
    return this.request("/physician/encounter", {
      method: "POST",
      body: data,
    });
  }

  async updateEncounter(encounterId: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/physician/encounter/${encounterId}`, {
      method: "PUT",
      body: data,
    });
  }

  async createPrescription(data: any): Promise<ApiResponse<any>> {
    return this.request("/physician/prescription", {
      method: "POST",
      body: data,
    });
  }

  async getAIDetails(patientId: string): Promise<ApiResponse<any>> {
    return this.request(`/physician/ai-details/${patientId}`);
  }

  async getHandoff(patientId: string): Promise<ApiResponse<any>> {
    return this.request(`/physician/handoff/${patientId}`);
  }

  async getPendingPrescriptions(): Promise<ApiResponse<any>> {
    return this.request("/physician/prescriptions");
  }

  async dispensePrescription(patientId: string): Promise<ApiResponse<any>> {
    return this.request(`/physician/prescription/${patientId}/dispense`, {
      method: "PUT",
    });
  }


  async getAdminDashboard(): Promise<ApiResponse<any>> {
    return this.request("/admin/dashboard");
  }

  async getDHISPayout(): Promise<ApiResponse<any>> {
    return this.request("/admin/dhis");
  }

  async generateClaim(encounterIds: string[]): Promise<ApiResponse<any>> {
    return this.request("/admin/dhis/generate-claim", {
      method: "POST",
      body: { encounterIds },
    });
  }

  async getSystemStatus(): Promise<ApiResponse<any>> {
    return this.request("/admin/system-status");
  }
}

export const api = new ApiClient(API_BASE_URL);
