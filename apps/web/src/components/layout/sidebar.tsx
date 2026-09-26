"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, LayoutDashboard, LogOut } from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { routes } from "@/lib/routes";

const navItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
] as const;

function isItemActive(pathname: string, href: string) {
    return href === "/dashboard"
        ? pathname === href || pathname.startsWith("/dashboard/links/")
        : pathname.startsWith(href);
}

export function DashboardSidebar() {
    const pathname = usePathname();
    const logout = useLogout();

    return (
        <Sidebar>
            <SidebarHeader className="pt-2 pb-0">
                <Link
                    href={routes.home}
                    className="inline-flex w-fit items-center rounded-md px-3 py-3 text-sm font-semibold tracking-[0.22em] uppercase text-foreground/90 transition-colors hover:bg-sidebar-accent"
                >
                    Shortly
                </Link>
            </SidebarHeader>

            <SidebarSeparator className="my-2" />

            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu className="gap-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <SidebarMenuItem
                                    key={item.label}
                                    className="rounded-lg"
                                >
                                    <SidebarMenuButton
                                        isActive={isItemActive(
                                            pathname,
                                            item.href,
                                        )}
                                        size="lg"
                                        className="px-4"
                                        render={<Link href={item.href} />}
                                    >
                                        <Icon />
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarSeparator className="my-2" />

            <SidebarFooter className="gap-2 p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="px-4"
                            render={<Link href={routes.home} />}
                            variant="outline"
                        >
                            <ArrowLeft />
                            <span>Back to landing</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="px-4 text-destructive hover:text-destructive"
                            onClick={() => void logout()}
                        >
                            <LogOut />
                            <span>Log out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
