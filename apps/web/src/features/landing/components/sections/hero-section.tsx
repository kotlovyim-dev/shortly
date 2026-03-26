"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function HeroSection() {
    return (
        <section
            id="top"
            className="relative flex min-h-screen w-full items-center overflow-hidden border-y border-border/70 bg-[url('/hero.png')] bg-cover bg-center bg-no-repeat px-6 py-12 shadow-[0_20px_80px_oklch(0.15_0_0/0.08)] sm:px-10 sm:py-16 lg:px-16 lg:py-20"
        >
            <div className="pointer-events-none absolute inset-0 bg-background/55" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,oklch(0.15_0_0/0.35),oklch(0.15_0_0/0.15))] dark:bg-[linear-gradient(to_bottom,oklch(0.1_0_0/0.45),oklch(0.1_0_0/0.3))]" />

            <div className="relative z-10 grid w-full items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
                <div className="space-y-7">
                    <Badge
                        variant="secondary"
                        className="w-fit bg-primary/15 px-4 py-1.5 text-sm text-primary"
                    >
                        Shortly Analytics
                    </Badge>
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
                            variant="outline"
                            size="lg"
                            disabled
                            className="h-14 rounded-2xl px-10 text-base"
                        >
                            Live analytics inside
                        </Button>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-white/30 bg-white/5 p-8 shadow-[0_26px_90px_oklch(0.1_0_0/0.28)] ring-1 ring-white/30 backdrop-saturate-150 sm:p-10 lg:p-12 dark:border-white/10 dark:bg-white/8 dark:ring-white/20 backdrop-blur-sm">
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,oklch(0.98_0.02_285/0.3),oklch(0.96_0.01_230/0.14))] dark:bg-[linear-gradient(135deg,oklch(0.28_0.02_285/0.34),oklch(0.16_0.01_230/0.22))]" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,oklch(0.72_0.22_300/0.45)_1px,transparent_1.6px)] bg-size-[14px_14px] opacity-70 mix-blend-overlay" />

                    <div className="relative z-10 space-y-6">
                        <p className="text-base font-semibold text-foreground/90">
                            Quick demo
                        </p>
                        <Input
                            defaultValue="https://example.com/campaign/spring-collection"
                            aria-label="Long URL"
                            className="h-12 border-white/50 bg-white/45 text-base text-foreground placeholder:text-foreground/60 backdrop-blur-md dark:bg-black/25"
                        />
                        <Select>
                            <SelectTrigger
                                className="py-4 w-full border-white/50 bg-white/45 text-base text-foreground backdrop-blur-md dark:bg-black/25"
                                aria-label="Channel"
                            >
                                <SelectValue placeholder="Select a channel" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="marketing">
                                    Marketing
                                </SelectItem>
                                <SelectItem value="social">Social</SelectItem>
                                <SelectItem value="support">Support</SelectItem>
                            </SelectContent>
                        </Select>
                        <Link
                            href="/register"
                            className={cn(
                                buttonVariants({ variant: "default" }),
                                "h-14 w-full rounded-2xl text-base font-semibold shadow-[0_12px_30px_oklch(0.57_0.23_285/0.45)]",
                            )}
                        >
                            Start free
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
