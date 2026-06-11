import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { APP_CONFIG } from "@/config/app.config";
import { ROUTES } from "@/config/routes.config";
import { AUTH_ENDPOINTS } from "./endpoints";
import { normalizeError } from "./error-handler";
import type { SafeUser } from "@/types";
import { useAuthStore } from "@/stores/auth.store";

const SKIP_AUTH_PATHS = new Set<string>([
  AUTH_ENDPOINTS.login,
  AUTH_ENDPOINTS.registerBrand,
  AUTH_ENDPOINTS.registerCreator,
  AUTH_ENDPOINTS.verifyOtp,
  AUTH_ENDPOINTS.resendOtp,
  AUTH_ENDPOINTS.refresh,
]);

// ── Shared refresh lock — used by both the 401 interceptor and useSessionHydration ──

let isRefreshing = false;
let refreshQueue: Array<(token: string, user: SafeUser) => void> = [];
let refreshRejectQueue: Array<(err: unknown) => void> = [];

function drainQueue(token: string, user: SafeUser): void {
  refreshQueue.forEach((resolve) => resolve(token, user));
  refreshQueue = [];
  refreshRejectQueue = [];
}

function rejectQueue(err: unknown): void {
  refreshRejectQueue.forEach((reject) => reject(err));
  refreshQueue = [];
  refreshRejectQueue = [];
}

type RefreshApiResponse = {
  data: {
    accessToken: string;
    user: SafeUser;
  };
};

/**
 * Performs a token refresh with a mutual-exclusion lock.
 * Both the Axios 401 interceptor and useSessionHydration call this —
 * concurrent callers are queued and resolved with the same new token.
 * Returns the new access token and the refreshed user data.
 */
export async function performTokenRefresh(): Promise<{ accessToken: string; user: SafeUser }> {
  if (isRefreshing) {
    return new Promise<{ accessToken: string; user: SafeUser }>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Refresh timeout")), 10_000);
      refreshQueue.push((token, user) => {
        clearTimeout(timer);
        resolve({ accessToken: token, user });
      });
      refreshRejectQueue.push((err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  isRefreshing = true;

  try {
    const response = await apiClient.post<RefreshApiResponse>(AUTH_ENDPOINTS.refresh);
    const { accessToken, user } = response.data.data;

    drainQueue(accessToken, user);

    return { accessToken, user };
  } catch (error) {
    rejectQueue(error);
    throw error;
  } finally {
    isRefreshing = false;
  }
}

export function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: APP_CONFIG.apiBaseUrl,
    withCredentials: true,
    timeout: 15_000,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const { getAccessToken } = useAuthStore.getState();
    const token = getAccessToken();

    const path = config.url ?? "";
    const isPublic = SKIP_AUTH_PATHS.has(path);

    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      const status: number = error.response?.status ?? 0;
      const url = original.url ?? "";
      const isRefreshEndpoint = url.includes(AUTH_ENDPOINTS.refresh);
      // Intermediate-token endpoints carry their own Bearer token — a 401 there
      // means the intermediate token expired, not the session; don't trigger refresh.
      const isIntermediateTokenPath =
        url.includes("/complete-profile") || url.includes("/instagram/submit-email");

      if (status === 401 && !original._retry && !isRefreshEndpoint && !isIntermediateTokenPath) {
        original._retry = true;

        try {
          const { accessToken, user } = await performTokenRefresh();
          useAuthStore.getState().setSession(user, accessToken);
          original.headers.Authorization = `Bearer ${accessToken}`;
          return client(original);
        } catch {
          useAuthStore.getState().clearAuth();
          if (typeof window !== "undefined") {
            window.location.href = ROUTES.auth.login;
          }
          return Promise.reject(normalizeError(error));
        }
      }

      return Promise.reject(normalizeError(error));
    },
  );

  return client;
}

export const apiClient = createApiClient();
