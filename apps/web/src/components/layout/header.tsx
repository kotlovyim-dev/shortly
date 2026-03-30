"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Moon, Search, Sun, UserCircle2 } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardHeader({ pageTitle }: { pageTitle: string }) {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = mounted && resolvedTheme === "dark";

    const actions = (
        <>
            <Button
                className="size-8"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                size="icon-sm"
                type="button"
                variant="outline"
            >
                {isDark ? (
                    <Sun className="size-4" />
                ) : (
                    <Moon className="size-4" />
                )}
                <span className="sr-only">
                    {isDark ? "Switch to light theme" : "Switch to dark theme"}
                </span>
            </Button>

            <DropdownMenu>
                <DropdownMenuTrigger
                    aria-label="Open profile menu"
                    className="flex h-8 cursor-pointer items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-muted/70"
                >
                    <UserCircle2 className="size-4" />
                    <span className="hidden sm:inline">Profile</span>
                    <ChevronDown className="hidden size-3.5 sm:block" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-44">
                    <DropdownMenuItem>Account</DropdownMenuItem>
                    <DropdownMenuItem>Preferences</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );

    return (
        <header className="sticky top-0 z-30 border-b border-border/80 bg-background/94 px-3 py-2.5 pt-[env(safe-area-inset-top)] backdrop-blur-xl sm:px-4">
            <div className="md:hidden">
                <div className="flex min-h-12 items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                        <SidebarTrigger className="size-9 rounded-lg border border-border/70 bg-background/80" />
                        <p className="truncate text-sm font-semibold tracking-wide text-foreground/90 uppercase">
                            {pageTitle}
                        </p>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        {actions}
                    </div>
                </div>

                <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        aria-label="Search links"
                        className="h-9 rounded-lg bg-background pl-8"
                        placeholder="Search links"
                        type="search"
                    />
                </div>
            </div>

            <div className="hidden min-h-12.5 items-center justify-between gap-4 md:flex">
                <div className="relative w-full max-w-88">
                    <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        aria-label="Search links"
                        className="h-9 rounded-lg bg-background pl-8"
                        placeholder="Search links"
                        type="search"
                    />
                </div>

                <div className="flex items-center gap-2">{actions}</div>
            </div>
        </header>
    );
}
