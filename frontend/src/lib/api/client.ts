import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { APP_CONFIG } from "@/config/app.config";
import { ROUTES } from "@/config/routes.config";
import { AUTH_ENDPOINTS } from "./endpoints";
import { normalizeError } from "./error-handler";

const SKIP_AUTH_PATHS = new Set<string>([
  AUTH_ENDPOINTS.login,
  AUTH_ENDPOINTS.registerBrand,
  AUTH_ENDPOINTS.registerCreator,
  AUTH_ENDPOINTS.verifyOtp,
  AUTH_ENDPOINTS.resendOtp,
  AUTH_ENDPOINTS.refresh,
]);

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function drainQueue(token: string): void {
  refreshQueue.forEach((resolve) => resolve(token));
  refreshQueue = [];
}

function clearQueue(): void {
  refreshQueue = [];
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
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            refreshQueue.push((token) => {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(client(original));
            });
            setTimeout(() => reject(normalizeError(error)), 10_000);
          });
        }

        original._retry = true;
        isRefreshing = true;

        try {
          const refreshResponse = await client.post<{ data: { accessToken: string } }>(
            AUTH_ENDPOINTS.refresh,
          );
          const newToken = refreshResponse.data.data.accessToken;

          const { setAccessToken } = getAuthStore();
          setAccessToken(newToken);

          original.headers.Authorization = `Bearer ${newToken}`;
          drainQueue(newToken);

          return client(original);
        } catch {
          clearQueue();
          const { clearAuth } = getAuthStore();
          clearAuth();
          if (typeof window !== "undefined") {
            window.location.href = ROUTES.auth.login;
          }
          return Promise.reject(normalizeError(error));
        } finally {
          isRefreshing = false;
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
