import type { ReactNode } from "react";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type AuthShellProps = {
    title: string;
    description: string;
    eyebrow: string;
    form: ReactNode;
    footer: ReactNode;
};

export function AuthShell({
    title,
    description,
    eyebrow,
    form,
    footer,
}: AuthShellProps) {
    return (
        <main className="relative isolate min-h-screen overflow-hidden bg-background px-4 py-10 text-foreground sm:px-8 sm:py-14">
            <div className="pointer-events-none absolute left-[-12%] top-[-12%] h-72 w-72 rounded-full bg-[oklch(0.71_0.19_296/0.25)] blur-3xl" />
            <div className="pointer-events-none absolute bottom-[-18%] right-[-5%] h-80 w-80 rounded-full bg-[oklch(0.73_0.18_260/0.2)] blur-3xl" />

            <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
                <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/65 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                    <Badge
                        className="mb-5 bg-primary/15 text-primary"
                        variant="secondary"
                    >
                        {eyebrow}
                    </Badge>

                    <h1 className="font-heading text-3xl leading-tight font-semibold sm:text-4xl">
                        {title}
                    </h1>
                    <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {description}
                    </p>

                    <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                        <div className="rounded-2xl border border-border/70 bg-background/65 p-3">
                            <p className="font-heading text-lg font-semibold text-foreground">
                                1 click
                            </p>
                            <p>URL creation flow</p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-background/65 p-3">
                            <p className="font-heading text-lg font-semibold text-foreground">
                                Live
                            </p>
                            <p>real-time analytics</p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-background/65 p-3">
                            <p className="font-heading text-lg font-semibold text-foreground">
                                Secure
                            </p>
                            <p>token-based access</p>
                        </div>
                    </div>

                    <p className="mt-8 text-sm text-muted-foreground">
                        Back to{" "}
                        <Link
                            className="text-primary underline-offset-4 hover:underline"
                            href="/"
                        >
                            landing page
                        </Link>
                    </p>
                </section>

                <Card className="border-border/70 bg-card/88 shadow-2xl">
                    <CardHeader className="space-y-2">
                        <h2 className="font-heading text-2xl font-semibold">
                            Account access
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Continue to your personal workspace.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-5 pb-5">
                        {form}
                        {footer}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
