"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroSection() {
    return (
        <section
            id="top"
            className="relative flex min-h-screen w-full items-center overflow-hidden border-y border-border/70 bg-[url('/hero.png')] bg-cover bg-center bg-no-repeat px-6 py-12 shadow-[0_20px_80px_oklch(0.15_0_0/0.08)] sm:px-10 sm:py-16 lg:px-16 lg:py-24"
        >
            <div className="pointer-events-none absolute inset-0 bg-background/55" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,oklch(0.15_0_0/0.35),oklch(0.15_0_0/0.15))] dark:bg-[linear-gradient(to_bottom,oklch(0.1_0_0/0.45),oklch(0.1_0_0/0.3))]" />

            <div className="relative z-10 grid w-full items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
                <div className="space-y-7">
                    <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
                        Shorten links and see traffic live
                    </h1>
                    <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                        Create clean short links and track clicks, countries,
                        platforms, and devices in one simple dashboard.
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                        <Link
                            href="/register"
                            className={cn(
                                buttonVariants({ size: "lg" }),
                                "h-14 rounded-2xl px-10 text-base",
                            )}
                        >
                            Create your first link
                        </Link>
                        <Button
                            variant="dashed"
                            size="lg"
                            disabled
                            className="h-14 rounded-2xl px-10 text-base"
                        >
                            Live analytics inside
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
