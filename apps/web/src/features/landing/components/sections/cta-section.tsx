"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CtaSection() {
    return (
        <section className="rounded-3xl border border-border/70 bg-gradient-to-br from-primary/20 via-primary/8 to-background p-10 text-center shadow-[0_18px_70px_oklch(0.15_0_0_/_0.06)] backdrop-blur-xl sm:p-14">
            <h2 className="mx-auto max-w-3xl text-2xl font-semibold tracking-tight text-balance sm:text-4xl">
                Launch your first tracked link in minutes
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
                Create an account, shorten a URL, and watch results live.
            </p>
            <div className="mt-6 flex justify-center">
                <Link
                    href="/register"
                    className={cn(
                        buttonVariants({ size: "lg" }),
                        "h-11 rounded-xl px-7",
                    )}
                >
                    Get started free
                </Link>
            </div>
        </section>
    );
}
