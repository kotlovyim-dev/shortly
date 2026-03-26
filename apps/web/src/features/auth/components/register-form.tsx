"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegisterForm } from "@/features/auth/hooks/use-register-form";
import { routes } from "@/lib/routes";

import { AuthShell } from "./auth-shell";

export function RegisterForm() {
    const { form, handleSubmit, isSubmitting, serverError } = useRegisterForm();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
        useState(false);

    return (
        <AuthShell
            title="Create Account"
            description="Create your workspace to shorten links, organize campaigns, and watch live performance."
            eyebrow="Shortly signup"
            form={
                <form
                    className="space-y-5 sm:space-y-6"
                    noValidate
                    onSubmit={handleSubmit}
                >
                    <div className="space-y-1.5 sm:space-y-2">
                        <label
                            className="text-sm font-medium text-violet-950/90"
                            htmlFor="name"
                        >
                            Name
                        </label>
                        <Input
                            autoComplete="name"
                            className="h-11 rounded-xl border-violet-300/45 bg-white/70 px-3 text-sm text-violet-950 placeholder:text-violet-900/45 focus-visible:border-violet-500 focus-visible:ring-violet-300/50"
                            id="name"
                            placeholder="Your full name"
                            {...form.register("name")}
                        />
                        {form.formState.errors.name ? (
                            <p className="text-xs text-destructive">
                                {form.formState.errors.name.message}
                            </p>
                        ) : null}
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                        <label
                            className="text-sm font-medium text-violet-950/90"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <Input
                            autoComplete="email"
                            className="h-11 rounded-xl border-violet-300/45 bg-white/70 px-3 text-sm text-violet-950 placeholder:text-violet-900/45 focus-visible:border-violet-500 focus-visible:ring-violet-300/50"
                            id="email"
                            placeholder="Enter your email"
                            type="email"
                            {...form.register("email")}
                        />
                        {form.formState.errors.email ? (
                            <p className="text-xs text-destructive">
                                {form.formState.errors.email.message}
                            </p>
                        ) : null}
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                        <label
                            className="text-sm font-medium text-violet-950/90"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <Input
                                autoComplete="new-password"
                                className="h-11 rounded-xl border-violet-300/45 bg-white/70 px-3 pr-10 text-sm text-violet-950 placeholder:text-violet-900/45 focus-visible:border-violet-500 focus-visible:ring-violet-300/50"
                                id="password"
                                placeholder="At least 8 characters"
                                type={isPasswordVisible ? "text" : "password"}
                                {...form.register("password")}
                            />
                            <button
                                aria-label={
                                    isPasswordVisible
                                        ? "Hide password"
                                        : "Show password"
                                }
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-violet-700/70 transition-colors hover:text-violet-900"
                                onClick={() =>
                                    setIsPasswordVisible((current) => !current)
                                }
                                type="button"
                            >
                                {isPasswordVisible ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {form.formState.errors.password ? (
                            <p className="text-xs text-destructive">
                                {form.formState.errors.password.message}
                            </p>
                        ) : null}
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                        <label
                            className="text-sm font-medium text-violet-950/90"
                            htmlFor="confirmPassword"
                        >
                            Confirm password
                        </label>
                        <div className="relative">
                            <Input
                                autoComplete="new-password"
                                className="h-11 rounded-xl border-violet-300/45 bg-white/70 px-3 pr-10 text-sm text-violet-950 placeholder:text-violet-900/45 focus-visible:border-violet-500 focus-visible:ring-violet-300/50"
                                id="confirmPassword"
                                placeholder="Repeat password"
                                type={
                                    isConfirmPasswordVisible
                                        ? "text"
                                        : "password"
                                }
                                {...form.register("confirmPassword")}
                            />
                            <button
                                aria-label={
                                    isConfirmPasswordVisible
                                        ? "Hide confirm password"
                                        : "Show confirm password"
                                }
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-violet-700/70 transition-colors hover:text-violet-900"
                                onClick={() =>
                                    setIsConfirmPasswordVisible(
                                        (current) => !current,
                                    )
                                }
                                type="button"
                            >
                                {isConfirmPasswordVisible ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {form.formState.errors.confirmPassword ? (
                            <p className="text-xs text-destructive">
                                {form.formState.errors.confirmPassword.message}
                            </p>
                        ) : null}
                    </div>

                    {serverError ? (
                        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {serverError}
                        </p>
                    ) : null}

                    <Button
                        className="h-11 w-full rounded-xl bg-linear-to-r from-violet-700 to-violet-600 text-base text-white transition-opacity hover:opacity-95"
                        disabled={isSubmitting}
                        type="submit"
                    >
                        {isSubmitting
                            ? "Creating account..."
                            : "Create account"}
                    </Button>

                    <Button
                        className="h-11 w-full rounded-xl border-violet-300/50 bg-white/55 text-base text-violet-900/60"
                        disabled
                        type="button"
                        variant="outline"
                    >
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-violet-300/70 text-xs font-bold">
                            G
                        </span>
                        Google sign up (coming soon)
                    </Button>
                </form>
            }
            footer={
                <p className="pt-2 text-center text-sm text-violet-900/70 sm:text-base">
                    Already have an account?{" "}
                    <Link
                        className="font-semibold text-violet-900 underline-offset-4 hover:underline"
                        href={routes.auth.login}
                    >
                        Sign in
                    </Link>
                </p>
            }
        />
    );
}
