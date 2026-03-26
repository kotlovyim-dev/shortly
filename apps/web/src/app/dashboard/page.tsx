"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccessToken } from "@/features/auth/utils/auth-storage";

export default function DashboardPage() {
    const hasToken = Boolean(getAccessToken());

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
                            You are in. Auth flow is connected.
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-6 text-sm text-muted-foreground">
                        <p>
                            {hasToken
                                ? "Access token was saved successfully."
                                : "No access token found in localStorage."}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/">
                                <Button>Go to landing</Button>
                            </Link>
                            <Link href="/auth/login">
                                <Button variant="outline">Back to login</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
