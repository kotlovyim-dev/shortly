import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { routes } from "@/lib/routes";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

let refreshTokenRequest: Promise<void> | null = null;

const refreshClient = axios.create({
    baseURL,
    withCredentials: true,
});

export const api = axios.create({
    baseURL,
    withCredentials: true,
});

async function refreshAccessToken(): Promise<void> {
    if (!refreshTokenRequest) {
        refreshTokenRequest = refreshClient
            .post("/api/auth/refresh")
            .then(() => undefined)
            .finally(() => {
                refreshTokenRequest = null;
            });
    }

    return refreshTokenRequest;
}

function redirectToLogin(): void {
    if (typeof window !== "undefined") {
        window.location.href = routes.auth.login;
    }
}

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as
            | RetryableRequestConfig
            | undefined;

        if (!originalRequest || error.response?.status !== 401) {
            return Promise.reject(error);
        }

        const requestPath = originalRequest.url ?? "";
        const isAuthBootstrapRequest =
            requestPath.includes("/api/auth/login") ||
            requestPath.includes("/api/auth/register") ||
            requestPath.includes("/api/auth/refresh");

        if (originalRequest._retry || isAuthBootstrapRequest) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            await refreshAccessToken();

            return api(originalRequest);
        } catch (refreshError) {
            redirectToLogin();
            return Promise.reject(refreshError);
        }
    },
);
