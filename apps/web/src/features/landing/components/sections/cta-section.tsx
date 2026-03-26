"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CtaSection() {
    return (
        <section className="rounded-3xl border border-border/70 bg-linear-to-br from-primary/20 via-primary/8 to-background p-12 text-center shadow-[0_18px_70px_oklch(0.15_0_0/0.06)] backdrop-blur-xl sm:p-16 lg:p-20">
            <h2 className="mx-auto max-w-4xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
                Launch your first tracked link in minutes
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
                Create an account, shorten a URL, and watch results live.
            </p>
            <div className="mt-8 flex justify-center">
                <Link
                    href="/register"
                    className={cn(
                        buttonVariants({ size: "lg" }),
                        "h-14 rounded-2xl px-10 text-base",
                    )}
                >
                    Get started free
                </Link>
            </div>
        </section>
    );
}
