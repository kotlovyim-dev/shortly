"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { registerRequest } from "@/features/auth/api/auth.api";
import {
    type RegisterFormValues,
    registerSchema,
} from "@/features/auth/schemas/auth.schema";
import { setAccessToken } from "@/features/auth/utils/auth-storage";

export function useRegisterForm() {
    const [serverError, setServerError] = useState<string | null>(null);
    const router = useRouter();

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const handleSubmit = form.handleSubmit(async (values) => {
        setServerError(null);

        try {
            const response = await registerRequest({
                name: values.name.trim(),
                email: values.email,
                password: values.password,
            });

            setAccessToken(response.accessToken);
            router.replace("/dashboard");
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 409) {
                setServerError("This email is already in use.");
                return;
            }

            setServerError("Unable to create account right now. Please try again.");
        }
    });

    return {
        form,
        serverError,
        isSubmitting: form.formState.isSubmitting,
        handleSubmit,
    };
}
