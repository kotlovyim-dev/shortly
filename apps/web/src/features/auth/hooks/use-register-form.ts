"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { HTTPError } from "ky";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

import { registerRequest } from "@/features/auth/api/auth.api";
import {
    type RegisterFormValues,
    registerSchema,
} from "@/features/auth/schemas/auth.schema";

export function useRegisterForm() {
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

    const registerMutation = useMutation({
        mutationFn: (values: RegisterFormValues) =>
            registerRequest({
                name: values.name.trim(),
                email: values.email,
                password: values.password,
            }),
        onSuccess: () => {
            router.replace("/dashboard");
        },
    });

    const handleSubmit = form.handleSubmit((values) => {
        registerMutation.mutate(values);
    });

    let serverError: string | null = null;
    if (registerMutation.isError) {
        if (
            registerMutation.error instanceof HTTPError &&
            registerMutation.error.response?.status === 409
        ) {
            serverError = "This email is already in use.";
        } else {
            serverError =
                "Unable to create account right now. Please try again.";
        }
    }

    return {
        form,
        serverError,
        isSubmitting: registerMutation.isPending,
        handleSubmit,
    };
}
