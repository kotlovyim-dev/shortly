"use client";

import { AxiosError } from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserRequest } from "@/features/auth/api/auth.api";
import type { CurrentUserResponse } from "@/features/auth/types/auth.types";
import { routes } from "@/lib/routes";

export default function DashboardPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<CurrentUserResponse | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(true);
    const [serverError, setServerError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadCurrentUser() {
            try {
                const user = await getCurrentUserRequest();

                if (isMounted) {
                    setCurrentUser(user);
                }
            } catch (error) {
                if (
                    error instanceof AxiosError &&
                    error.response?.status === 401
                ) {
                    router.replace(routes.auth.login);
                    return;
                }

                if (isMounted) {
                    setServerError("Unable to load your session right now.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadCurrentUser();

        return () => {
            isMounted = false;
        };
    }, [router]);

    return (
        <main className="relative isolate min-h-screen overflow-hidden bg-background px-4 py-10 sm:px-8">
            <div className="pointer-events-none absolute left-[-12%] top-[-10%] h-72 w-72 rounded-full bg-[oklch(0.71_0.19_296/0.2)] blur-3xl" />
            <div className="mx-auto max-w-4xl">
                <Card className="border-border/70 bg-card/90 shadow-2xl">
                    <CardHeader className="space-y-3">
                        <Badge className="w-fit" variant="secondary">
                            Dashboard
                        </Badge>
                        <CardTitle className="font-heading text-2xl">
                            {currentUser
                                ? `Welcome back, ${currentUser.email}.`
                                : "You are in. Auth flow is connected."}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-6 text-sm text-muted-foreground">
                        <p>
                            {isLoading
                                ? "Checking your HttpOnly cookie session..."
                                : (serverError ??
                                  "Your session is managed with HttpOnly cookies.")}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/">
                                <Button>Go to landing</Button>
                            </Link>
                            <Link href={routes.auth.login}>
                                <Button variant="outline">Back to login</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
