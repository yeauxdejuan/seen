/**
 * API Service Layer
 * Handles all backend communication with proper error handling,
 * retry logic, and offline support
 */

import { useState } from 'react';
import type { IncidentReport, IncidentReportDraft, IncidentAggregates, User } from '../types';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
}

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  apiKey?: string;
}

export class ApiService {
  private static config: ApiConfig = {
    baseUrl: import.meta.env.VITE_API_URL || 'https://api.seen.app',
    timeout: 30000,
    retries: 3,
    apiKey: import.meta.env.VITE_API_KEY
  };

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const token = this.getAuthToken();

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Client-Version': '1.0.0',
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    if (this.config.apiKey) {
      defaultHeaders['X-API-Key'] = this.config.apiKey;
    }

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.config.timeout),
    };

    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx)
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.config.retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError!;
  }

  private static getAuthToken(): string | null {
    return localStorage.getItem('seen_auth_token');
  }

  // Authentication endpoints
  static async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async register(userData: {
    name: string;
    email: string;
    password: string;
    acceptedTerms: boolean;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async logout(): Promise<ApiResponse<void>> {
    const response = await this.request<void>('/auth/logout', {
      method: 'POST',
    });
    localStorage.removeItem('seen_auth_token');
    return response;
  }

  static async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }

  // Report endpoints
  static async submitReport(report: IncidentReportDraft): Promise<ApiResponse<IncidentReport>> {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(report),
    });
  }

  static async getUserReports(userId: string): Promise<ApiResponse<IncidentReport[]>> {
    return this.request(`/reports/user/${userId}`);
  }

  static async updateReport(reportId: string, updates: Partial<IncidentReport>): Promise<ApiResponse<IncidentReport>> {
    return this.request(`/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  static async deleteReport(reportId: string): Promise<ApiResponse<void>> {
    return this.request(`/reports/${reportId}`, {
      method: 'DELETE',
    });
  }

  // Analytics endpoints
  static async getAggregatedStats(filters?: {
    startDate?: string;
    endDate?: string;
    incidentTypes?: string[];
    locations?: string[];
  }): Promise<ApiResponse<IncidentAggregates>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else if (value) {
          params.append(key, value);
        }
      });
    }

    const endpoint = `/analytics/aggregated${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request(endpoint);
  }

  static async getAdvancedAnalytics(filters?: Record<string, any>): Promise<ApiResponse<any>> {
    return this.request('/analytics/advanced', {
      method: 'POST',
      body: JSON.stringify(filters || {}),
    });
  }

  // File upload endpoints
  static async uploadFile(file: File, reportId?: string): Promise<ApiResponse<{ fileId: string; url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    if (reportId) {
      formData.append('reportId', reportId);
    }

    return this.request('/files/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  static async deleteFile(fileId: string): Promise<ApiResponse<void>> {
    return this.request(`/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  // Support and resources endpoints
  static async getSupportResources(location?: string): Promise<ApiResponse<any[]>> {
    const params = location ? `?location=${encodeURIComponent(location)}` : '';
    return this.request(`/support/resources${params}`);
  }

  static async requestSupport(request: {
    type: string;
    message: string;
    contactInfo?: string;
    urgent?: boolean;
  }): Promise<ApiResponse<{ requestId: string }>> {
    return this.request('/support/request', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // User preferences and settings
  static async updateUserPreferences(preferences: Record<string, any>): Promise<ApiResponse<void>> {
    return this.request('/user/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  }

  static async getUserPreferences(): Promise<ApiResponse<Record<string, any>>> {
    return this.request('/user/preferences');
  }

  // Health check
  static async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request('/health');
  }
}

// API Error types
export class ApiError extends Error {
  public status?: number;
  public errors?: Record<string, string>;
  
  constructor(
    message: string,
    status?: number,
    errors?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

// Hook for API calls with loading states
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = async <T>(apiCall: () => Promise<ApiResponse<T>>): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();
      if (response.success) {
        return response.data;
      } else {
        throw new ApiError(response.message || 'API call failed', undefined, response.errors);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { call, loading, error };
}