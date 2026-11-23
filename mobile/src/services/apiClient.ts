/**
 * Centralized API Client — src/services/apiClient.ts
 * Manages HTTP communication, Bearer authentication attachment from Expo SecureStore,
 * request timeouts via AbortController, error normalization, and non-JSON resilience.
 */

import * as SecureStore from 'expo-secure-store';
import { APP_CONFIG } from '../config/appConfig';
import { ApiResponse } from '../types/common';

const TOKEN_KEY = 'mj_auth_token';

type AuthExpiredListener = () => void;
let authExpiredListeners: AuthExpiredListener[] = [];

export function onAuthExpired(listener: AuthExpiredListener): () => void {
  authExpiredListeners.push(listener);
  return () => {
    authExpiredListeners = authExpiredListeners.filter((l) => l !== listener);
  };
}

export function notifyAuthExpired(): void {
  authExpiredListeners.forEach((l) => {
    try {
      l();
    } catch {
      // Isolate listener error
    }
  });
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  requiresAuth?: boolean;
}

/**
 * Core HTTP Request Method
 */
export async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const baseUrl = APP_CONFIG.api.getBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const timeoutMs = options.timeoutMs || APP_CONFIG.api.timeoutMs;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-client-platform': 'mobile',
    ...(options.headers as Record<string, string>),
  };

  // Attach Bearer token from SecureStore if available
  if (!headers.Authorization && !headers.authorization) {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Graceful fallback if SecureStore is unavailable
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Parse Response (guard against HTML error pages or non-JSON payloads)
    const contentType = response.headers.get('content-type') || '';
    let responseData: any = null;

    if (contentType.includes('application/json')) {
      responseData = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => '');
      responseData = { message: text.slice(0, 200) || `HTTP status ${response.status}` };
    }

    if (!response.ok) {
      if (response.status === 401) {
        SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
        notifyAuthExpired();
      }

      const errorMessage =
        responseData?.message ||
        responseData?.error ||
        `Request failed with status ${response.status}`;

      return {
        success: false,
        error: errorMessage,
        statusCode: response.status,
      };
    }

    // Backend standardized envelope returns { success: true, data: T, message: string }
    const unwrappedData =
      responseData?.data !== undefined ? responseData.data : responseData;

    return {
      success: true,
      data: unwrappedData as T,
      message: responseData?.message,
      statusCode: response.status,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Network request timed out. Please check your internet connection.',
        statusCode: 408,
      };
    }

    return {
      success: false,
      error: error?.message || 'Network request failed. Please check your connection.',
      statusCode: 0,
    };
  }
}

/** Convenience GET helper */
export function apiGet<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
  return request<T>(endpoint, { ...options, method: 'GET' });
}

/** Convenience POST helper */
export function apiPost<T>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/** Convenience PATCH helper */
export function apiPatch<T>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/** Convenience DELETE helper */
export function apiDelete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
  return request<T>(endpoint, { ...options, method: 'DELETE' });
}

/** Core API client alias */
export const apiClient = request;
