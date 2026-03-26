import type { ReactNode } from "react";

import { Header } from "@/features/landing/components/header";

export default function LandingLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <div className="relative isolate flex min-h-screen flex-col bg-background text-foreground">
            <Header />
            <div className="flex-1">{children}</div>
        </div>
    );
}
