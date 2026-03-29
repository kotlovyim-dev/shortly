"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    Link2,
    LayoutDashboard,
    LogOut,
    Plus,
    Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

const navItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "My Links",
        href: "/dashboard#links",
        icon: Link2,
    },
    {
        label: "Create Link",
        href: "/dashboard#create",
        icon: Plus,
    },
    {
        label: "Analytics",
        href: "/dashboard#analytics",
        icon: BarChart3,
    },
    {
        label: "Settings",
        href: "/dashboard#settings",
        icon: Settings,
    },
] as const;

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_8%_5%,oklch(0.72_0.2_296/0.22),transparent_30%)]" />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_94%_0%,oklch(0.66_0.19_282/0.16),transparent_28%)]" />

            <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-5 lg:grid-cols-[244px_1fr]">
                <aside className="rounded-3xl border border-border/65 bg-card/72 p-4 shadow-[0_24px_72px_oklch(0.15_0_0/0.07)] backdrop-blur-xl lg:h-full">
                    <div className="flex items-center gap-3 border-b border-border/70 px-2 pb-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/16 text-primary">
                            <Link2 className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold tracking-wide">
                                Shortly
                            </p>
                            <p className="text-xs text-muted-foreground">
                                URL Shortener
                            </p>
                        </div>
                    </div>

                    <nav className="mt-5 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive =
                                item.href === "/dashboard"
                                    ? pathname === "/dashboard"
                                    : false;

                            return (
                                <Link
                                    key={item.label}
                                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${isActive ? "bg-primary/14 text-primary" : "text-muted-foreground hover:bg-primary/8 hover:text-foreground"}`}
                                    href={item.href}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-8 space-y-2 border-t border-border/70 pt-4">
                        <Link className="block" href={routes.home}>
                            <Button
                                className="w-full justify-start"
                                variant="outline"
                            >
                                Back to landing
                            </Button>
                        </Link>
                        <Link className="block" href={routes.auth.login}>
                            <Button
                                className="w-full justify-start text-destructive hover:text-destructive"
                                variant="ghost"
                            >
                                <LogOut className="h-4 w-4" />
                                Log out
                            </Button>
                        </Link>
                    </div>
                </aside>

                <section className="h-full">{children}</section>
            </div>
        </div>
    );
}
