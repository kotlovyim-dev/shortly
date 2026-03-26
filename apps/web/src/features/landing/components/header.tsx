"use client";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
    { label: "Features", href: "#features" },
    { label: "Analytics", href: "#analytics" },
    { label: "Get started", href: "#cta" },
];

export function Header() {
    return (
        <header className="fixed inset-x-0 top-0 z-50 hidden md:block">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex w-full items-center justify-between gap-4 rounded-full border border-white/35 bg-white/35 px-4 py-3 shadow-[0_18px_60px_oklch(0.15_0_0/0.12)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-black/20">
                    <Link
                        href="#top"
                        className="shrink-0 text-sm font-semibold tracking-[0.22em] uppercase text-foreground/90"
                    >
                        Shortly
                    </Link>

                    <nav className="hidden items-center justify-center gap-2 md:flex">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="rounded-full px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-white/50 hover:text-foreground dark:hover:bg-white/10"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <Link
                        href="/register"
                        className={cn(
                            buttonVariants({ variant: "default", size: "lg" }),
                            "shrink-0 rounded-full px-4 text-sm shadow-[0_10px_30px_oklch(0.57_0.24_296/0.28)]",
                        )}
                    >
                        Start free
                    </Link>
                </div>
            </div>
        </header>
    );
}
