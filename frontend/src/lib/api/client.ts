import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { APP_CONFIG } from "@/config/app.config";
import { ROUTES } from "@/config/routes.config";
import { AUTH_ENDPOINTS } from "./endpoints";
import { normalizeError } from "./error-handler";
import type { SafeUser } from "@/types";

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
let refreshQueue: Array<(token: string) => void> = [];
let refreshRejectQueue: Array<(err: unknown) => void> = [];

function drainQueue(token: string): void {
  refreshQueue.forEach((resolve) => resolve(token));
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
      refreshQueue.push((token) => resolve({ accessToken: token, user: getAuthStore().user! }));
      refreshRejectQueue.push(reject);
      setTimeout(() => reject(new Error("Refresh timeout")), 10_000);
    });
  }

  isRefreshing = true;

  try {
    const response = await apiClient.post<RefreshApiResponse>(AUTH_ENDPOINTS.refresh);
    const { accessToken, user } = response.data.data;

    getAuthStore().setAccessToken(accessToken);
    drainQueue(accessToken);

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
    const { getAccessToken } = getAuthStore();
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
      const isRefreshEndpoint = (original.url ?? "").includes(AUTH_ENDPOINTS.refresh);

      if (status === 401 && !original._retry && !isRefreshEndpoint) {
        original._retry = true;

        try {
          const { accessToken } = await performTokenRefresh();
          original.headers.Authorization = `Bearer ${accessToken}`;
          return client(original);
        } catch {
          getAuthStore().clearAuth();
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

// Lazy import to avoid circular dependency (store imports client, client imports store)
function getAuthStore() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useAuthStore } = require("@/stores/auth.store") as typeof import("@/stores/auth.store");
  return useAuthStore.getState();
}

export const apiClient = createApiClient();
