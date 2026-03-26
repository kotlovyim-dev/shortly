"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { loginRequest } from "@/features/auth/api/auth.api";
import {
    type LoginFormValues,
    loginSchema,
} from "@/features/auth/schemas/auth.schema";
import { setAccessToken } from "@/features/auth/utils/auth-storage";

export function useLoginForm() {
    const [serverError, setServerError] = useState<string | null>(null);
    const router = useRouter();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleSubmit = form.handleSubmit(async (values) => {
        setServerError(null);

        try {
            const response = await loginRequest(values);
            setAccessToken(response.accessToken);
            router.replace("/dashboard");
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 401) {
                setServerError("Incorrect email or password.");
                return;
            }

            setServerError("Unable to login right now. Please try again.");
        }
    });

    return {
        form,
        serverError,
        isSubmitting: form.formState.isSubmitting,
        handleSubmit,
    };
}
