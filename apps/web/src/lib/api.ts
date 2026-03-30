import ky from "ky";

import { routes } from "@/lib/routes";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

let refreshTokenRequest: Promise<void> | null = null;

const refreshClient = ky.create({
    prefixUrl: baseURL,
    credentials: "include",
});

export const api = ky.create({
    prefixUrl: baseURL,
    credentials: "include",
    hooks: {
        afterResponse: [
            async (request, options, response) => {
                if (response.status === 401) {
                    const requestPath = request.url;
                    const isAuthBootstrapRequest =
                        requestPath.includes("/api/auth/login") ||
                        requestPath.includes("/api/auth/register") ||
                        requestPath.includes("/api/auth/refresh");

                    if (isAuthBootstrapRequest) {
                        return;
                    }

                    if (!refreshTokenRequest) {
                        refreshTokenRequest = refreshClient
                            .post("api/auth/refresh")
                            .json()
                            .then(() => undefined)
                            .finally(() => {
                                refreshTokenRequest = null;
                            });
                    }

                    try {
                        await refreshTokenRequest;
                        return ky(request);
                    } catch (refreshError) {
                        if (typeof window !== "undefined") {
                            window.location.href = routes.auth.login;
                        }
                        throw refreshError;
                    }
                }
            },
        ],
    },
});
