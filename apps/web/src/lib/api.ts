import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import {
    clearAccessToken,
    getAccessToken,
    setAccessToken,
} from "@/features/auth/utils/auth-storage";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

type RefreshResponse = {
    accessToken: string;
};

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

let refreshTokenRequest: Promise<string> | null = null;

const refreshClient = axios.create({
    baseURL,
    withCredentials: true,
});

export const api = axios.create({
    baseURL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
});

async function refreshAccessToken(): Promise<string> {
    if (!refreshTokenRequest) {
        refreshTokenRequest = refreshClient
            .post<RefreshResponse>("/api/auth/refresh")
            .then((response) => {
                setAccessToken(response.data.accessToken);
                return response.data.accessToken;
            })
            .finally(() => {
                refreshTokenRequest = null;
            });
    }

    return refreshTokenRequest;
}

function redirectToLogin(): void {
    clearAccessToken();

    if (typeof window !== "undefined") {
        window.location.href = "/login";
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
            const newToken = await refreshAccessToken();
            originalRequest.headers.set("Authorization", `Bearer ${newToken}`);

            return api(originalRequest);
        } catch (refreshError) {
            redirectToLogin();
            return Promise.reject(refreshError);
        }
    },
);
