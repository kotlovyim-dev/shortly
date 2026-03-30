"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

import { registerRequest } from "@/features/auth/api/auth.api";
import {
    type RegisterFormValues,
    registerSchema,
} from "@/features/auth/schemas/auth.schema";
import { getApiErrorMessage } from "@/lib/api-error";

export function useRegisterForm() {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const registerMutation = useMutation({
        mutationFn: (values: RegisterFormValues) =>
            registerRequest({
                name: values.name.trim(),
                email: values.email,
                password: values.password,
            }),
        onSuccess: () => {
            setServerError(null);
            router.replace("/dashboard");
        },
        onError: async (error) => {
            const message = await getApiErrorMessage(
                error,
                "Unable to create account right now. Please try again.",
            );
            setServerError(message);
        },
    });

    const handleSubmit = form.handleSubmit((values) => {
        setServerError(null);
        registerMutation.mutate(values);
    });

    return {
        form,
        serverError,
        isSubmitting: registerMutation.isPending,
        handleSubmit,
    };
}
