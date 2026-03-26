"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegisterForm } from "@/features/auth/hooks/use-register-form";

import { AuthShell } from "./auth-shell";

export function RegisterForm() {
    const { form, handleSubmit, isSubmitting, serverError } = useRegisterForm();

    return (
        <AuthShell
            title="Create your Shortly workspace"
            description="Turn long URLs into clear, trackable campaigns. Create an account and unlock live metrics for every shared link."
            eyebrow="Start with auth"
            form={
                <form className="space-y-4" noValidate onSubmit={handleSubmit}>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium" htmlFor="name">
                            Name
                        </label>
                        <Input
                            autoComplete="name"
                            id="name"
                            placeholder="Your name"
                            {...form.register("name")}
                        />
                        {form.formState.errors.name ? (
                            <p className="text-xs text-destructive">
                                {form.formState.errors.name.message}
                            </p>
                        ) : null}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium" htmlFor="email">
                            Email
                        </label>
                        <Input
                            autoComplete="email"
                            id="email"
                            placeholder="you@domain.com"
                            type="email"
                            {...form.register("email")}
                        />
                        {form.formState.errors.email ? (
                            <p className="text-xs text-destructive">
                                {form.formState.errors.email.message}
                            </p>
                        ) : null}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium" htmlFor="password">
                            Password
                        </label>
                        <Input
                            autoComplete="new-password"
                            id="password"
                            placeholder="At least 8 characters"
                            type="password"
                            {...form.register("password")}
                        />
                        {form.formState.errors.password ? (
                            <p className="text-xs text-destructive">
                                {form.formState.errors.password.message}
                            </p>
                        ) : null}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium" htmlFor="confirmPassword">
                            Confirm password
                        </label>
                        <Input
                            autoComplete="new-password"
                            id="confirmPassword"
                            placeholder="Repeat password"
                            type="password"
                            {...form.register("confirmPassword")}
                        />
                        {form.formState.errors.confirmPassword ? (
                            <p className="text-xs text-destructive">
                                {form.formState.errors.confirmPassword.message}
                            </p>
                        ) : null}
                    </div>

                    {serverError ? (
                        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                            {serverError}
                        </p>
                    ) : null}

                    <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">
                        {isSubmitting ? "Creating account..." : "Create account"}
                    </Button>
                </form>
            }
            footer={
                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link className="text-primary underline-offset-4 hover:underline" href="/auth/login">
                        Sign in
                    </Link>
                </p>
            }
        />
    );
}
