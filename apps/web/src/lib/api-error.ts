import { HTTPError } from "ky";

type ApiErrorPayload = {
    message?: string | string[];
    error?: string;
};

export async function getApiErrorMessage(
    error: unknown,
    fallbackMessage: string,
): Promise<string> {
    if (!(error instanceof HTTPError)) {
        return fallbackMessage;
    }

    try {
        const payload =
            (await error.response.clone().json()) as ApiErrorPayload | null;

        if (!payload) {
            return fallbackMessage;
        }

        if (typeof payload.message === "string" && payload.message.trim()) {
            return payload.message;
        }

        if (Array.isArray(payload.message) && payload.message.length > 0) {
            return payload.message.join(" ");
        }

        if (typeof payload.error === "string" && payload.error.trim()) {
            return payload.error;
        }
    } catch {
        return fallbackMessage;
    }

    return fallbackMessage;
}