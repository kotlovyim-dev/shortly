"use client";

import { useSyncExternalStore } from "react";
import { ChevronDown, Moon, Search, Sun, UserCircle2 } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { routes } from "@/lib/routes";
import { useLinksSearchStore } from "@/lib/store";

function LinksSearchInput() {
    const query = useLinksSearchStore((state) => state.query);
    const setQuery = useLinksSearchStore((state) => state.setQuery);

    return (
        <div className="relative w-full md:max-w-88">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                aria-label="Search links"
                className="h-9 rounded-lg bg-background pl-8"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search links"
                type="search"
                value={query}
            />
        </div>
    );
}

export function DashboardHeader({ pageTitle }: { pageTitle: string }) {
    const { resolvedTheme, setTheme } = useTheme();
    const logout = useLogout();
    // Search only filters the links table, so hide it on other pages.
    const showSearch = usePathname() === routes.dashboard.home;
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );

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
                    <DropdownMenuItem
                        onClick={() => void logout()}
                        variant="destructive"
                    >
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

                {showSearch ? <LinksSearchInput /> : null}
            </div>

            <div className="hidden min-h-12.5 items-center justify-between gap-4 md:flex">
                {showSearch ? <LinksSearchInput /> : <div />}

                <div className="flex items-center gap-2">{actions}</div>
            </div>
        </header>
    );
}
