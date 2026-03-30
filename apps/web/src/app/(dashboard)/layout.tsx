"use client";

import { usePathname } from "next/navigation";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "../../components/layout/header";

function getDashboardPageTitle(pathname: string): string {
    if (pathname === "/dashboard") {
        return "Dashboard";
    }

    if (pathname.startsWith("/dashboard/analytics")) {
        return "Analytics";
    }

    if (pathname.startsWith("/dashboard/settings")) {
        return "Settings";
    }

    if (pathname.startsWith("/dashboard/links")) {
        return "Links";
    }

    return "Dashboard";
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const mobilePageTitle = getDashboardPageTitle(pathname);

    return (
        <div className="flex min-h-100vh ">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_8%_5%,oklch(0.72_0.2_296/0.22),transparent_30%)]" />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_94%_0%,oklch(0.66_0.19_282/0.16),transparent_28%)]" />

            <SidebarProvider>
                <div className="flex min-h-svh w-full gap-0">
                    <DashboardSidebar />

                    <SidebarInset className="min-h-full flex-1 overflow-visible rounded-none border-none bg-transparent shadow-none backdrop-blur-0">
                        <DashboardHeader pageTitle={mobilePageTitle} />
                        <section className="h-full px-2 pt-3 pb-0 sm:px-3 sm:pt-4 lg:px-5">
                            {children}
                        </section>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </div>
    );
}
