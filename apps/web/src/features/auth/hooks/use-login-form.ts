"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

import { loginRequest } from "@/features/auth/api/auth.api";
import {
    type LoginFormValues,
    loginSchema,
} from "@/features/auth/schemas/auth.schema";
import { getApiErrorMessage } from "@/lib/api-error";

export function useLoginForm() {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const loginMutation = useMutation({
        mutationFn: loginRequest,
        onSuccess: () => {
            setServerError(null);
            router.replace("/dashboard");
        },
        onError: async (error) => {
            const message = await getApiErrorMessage(
                error,
                "Unable to login right now. Please try again.",
            );
            setServerError(message);
        },
    });

    const handleSubmit = form.handleSubmit((values) => {
        setServerError(null);
        loginMutation.mutate(values);
    });

    return {
        form,
        serverError,
        isSubmitting: loginMutation.isPending,
        handleSubmit,
    };
}
