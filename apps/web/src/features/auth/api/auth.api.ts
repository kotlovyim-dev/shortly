import { api } from "@/lib/api";

import type {
    AuthTokensResponse,
    LoginPayload,
    RegisterPayload,
} from "@/features/auth/types/auth.types";

export async function loginRequest(payload: LoginPayload) {
    const response = await api.post<AuthTokensResponse>(
        "/api/auth/login",
        payload,
    );
    return response.data;
}

export async function registerRequest(payload: RegisterPayload) {
    const response = await api.post<AuthTokensResponse>(
        "/api/auth/register",
        payload,
    );
    return response.data;
}

export async function refreshRequest() {
    const response = await api.post<AuthTokensResponse>("/api/auth/refresh");
    return response.data;
}
