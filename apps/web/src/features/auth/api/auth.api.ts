import { api } from "@/lib/api";

import type {
    CurrentUserResponse,
    LoginPayload,
    RegisterPayload,
} from "@/features/auth/types/auth.types";

export async function loginRequest(payload: LoginPayload): Promise<void> {
    await api.post("api/auth/login", { json: payload });
}

export async function registerRequest(payload: RegisterPayload): Promise<void> {
    await api.post("api/auth/register", { json: payload });
}

export async function refreshRequest(): Promise<void> {
    await api.post("api/auth/refresh");
}

export async function getCurrentUserRequest(): Promise<CurrentUserResponse> {
    return api.get("api/auth/me").json<CurrentUserResponse>();
}
