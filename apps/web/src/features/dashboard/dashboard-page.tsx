"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinksTableContainer } from "@/features/dashboard/components/links-table-container";
import { LinksModal } from "@/features/links/components/links-modal";

interface DashboardPageProps {
    currentUserEmail: string | null;
    sessionError: string | null;
}

export function DashboardPage({
    currentUserEmail,
    sessionError,
}: DashboardPageProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    return (
        <Card className="h-full rounded-2xl border border-border/60 bg-card/74 shadow-[0_24px_70px_oklch(0.15_0_0/0.08)] backdrop-blur-xl sm:rounded-3xl">
            <CardHeader className="border-b border-border/70 px-4 py-5 sm:px-6 sm:py-6">
                <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                        <Badge
                            className="w-fit bg-primary/14 text-primary"
                            variant="secondary"
                        >
                            Dashboard
                        </Badge>
                        <CardTitle className="font-heading text-3xl leading-tight sm:text-4xl">
                            {currentUserEmail
                                ? `Welcome back, ${currentUserEmail}`
                                : "Links Overview"}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground sm:text-base">
                            Manage your short URLs, quickly toggle status, and
                            monitor click performance.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                        <Button
                            className="h-13 px-6 text-base font-semibold"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <PlusIcon />
                            Add New Link
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 px-0 pb-5 pt-3 sm:pb-6 sm:pt-4">
                {sessionError ? (
                    <div className="mx-4 rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive sm:mx-6">
                        {sessionError}
                    </div>
                ) : null}

                <LinksTableContainer />

                <LinksModal
                    onOpenChange={setIsAddModalOpen}
                    open={isAddModalOpen}
                    variant="add"
                />
            </CardContent>
        </Card>
    );
}
