"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { HTTPError } from "ky";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

import { loginRequest } from "@/features/auth/api/auth.api";
import {
    type LoginFormValues,
    loginSchema,
} from "@/features/auth/schemas/auth.schema";

export function useLoginForm() {
    const router = useRouter();

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
            router.replace("/dashboard");
        },
    });

    const handleSubmit = form.handleSubmit((values) => {
        loginMutation.mutate(values);
    });

    let serverError: string | null = null;
    if (loginMutation.isError) {
        if (
            loginMutation.error instanceof HTTPError &&
            loginMutation.error.response?.status === 401
        ) {
            serverError = "Incorrect email or password.";
        } else {
            serverError = "Unable to login right now. Please try again.";
        }
    }

    return {
        form,
        serverError,
        isSubmitting: loginMutation.isPending,
        handleSubmit,
    };
}
