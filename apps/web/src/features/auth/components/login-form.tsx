"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLoginForm } from "@/features/auth/hooks/use-login-form";

import { AuthShell } from "./auth-shell";

export function LoginForm() {
    const { form, handleSubmit, isSubmitting, serverError } = useLoginForm();

    return (
        <AuthShell
            title="Welcome back to your link intelligence"
            description="Track every click with zero noise. Sign in and continue managing your links, channels, and conversion insights."
            eyebrow="Shortly auth"
            form={
                <form className="space-y-4" noValidate onSubmit={handleSubmit}>
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
                            autoComplete="current-password"
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

                    {serverError ? (
                        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                            {serverError}
                        </p>
                    ) : null}

                    <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">
                        {isSubmitting ? "Signing in..." : "Sign in"}
                    </Button>
                </form>
            }
            footer={
                <p className="text-center text-sm text-muted-foreground">
                    New to Shortly?{" "}
                    <Link className="text-primary underline-offset-4 hover:underline" href="/auth/register">
                        Create an account
                    </Link>
                </p>
            }
        />
    );
}
