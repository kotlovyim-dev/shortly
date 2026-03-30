"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MousePointerClick } from "lucide-react";
import { HTTPError } from "ky";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserRequest } from "@/features/auth/api/auth.api";
import { LinksDataTable } from "@/features/links/components/links-data-table";
import {
    listLinksRequest,
    updateLinkActivityRequest,
} from "@/features/links/api/links.api";
import type { LinkSummary } from "@/features/links/types/links.types";

const PAGE_SIZE = 10;
const SHORT_BASE_URL =
    process.env.NEXT_PUBLIC_WEB_BASE_URL ?? "http://localhost:3000";

export default function DashboardPage() {
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const copyTimeoutRef = useRef<number | null>(null);

    const {
        data: currentUser,
        isError: isUserError,
        error: userError,
    } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUserRequest,
        retry: false,
    });

    const {
        data: linksPage,
        isLoading: isLinksLoading,
        isFetching: isLinksFetching,
        isError: isLinksError,
    } = useQuery({
        queryKey: ["links", page],
        queryFn: () => listLinksRequest({ page, limit: PAGE_SIZE }),
    });

    const toggleMutation = useMutation({
        mutationFn: ({
            linkId,
            isActive,
        }: {
            linkId: string;
            isActive: boolean;
        }) => updateLinkActivityRequest(linkId, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["links"] });
            setActionError(null);
        },
        onError: () => {
            setActionError("Failed to update link status.");
        },
    });

    async function handleCopyShortUrl(link: LinkSummary): Promise<void> {
        const shortUrl = `${SHORT_BASE_URL}/${link.shortCode}`;

        try {
            await navigator.clipboard.writeText(shortUrl);
            setCopiedLinkId(link.id);
            if (copyTimeoutRef.current !== null) {
                window.clearTimeout(copyTimeoutRef.current);
            }
            copyTimeoutRef.current = window.setTimeout(() => {
                setCopiedLinkId(null);
                copyTimeoutRef.current = null;
            }, 1600);
        } catch {
            setActionError("Clipboard access failed. Copy manually instead.");
        }
    }

    const isLoading = isLinksLoading && !linksPage;
    const isRefreshingPage = isLinksFetching && !!linksPage;
    const safeLinksPage = linksPage ?? {
        items: [],
        page: 1,
        limit: PAGE_SIZE,
        total: 0,
        totalPages: 0,
        totalClicks: 0,
    };
    const togglingLinkId = toggleMutation.isPending
        ? toggleMutation.variables.linkId
        : null;

    const pageStart =
        safeLinksPage.total === 0
            ? 0
            : (safeLinksPage.page - 1) * safeLinksPage.limit + 1;
    const pageEnd =
        safeLinksPage.total === 0
            ? 0
            : Math.min(
                  safeLinksPage.page * safeLinksPage.limit,
                  safeLinksPage.total,
              );

    const canGoPrev = page > 1;
    const canGoNext = safeLinksPage.totalPages > page;

    let displayError = actionError;
    if (!displayError && isUserError) {
        if (!(userError instanceof HTTPError && userError.response?.status === 401)) {
            displayError = "Unable to verify your session right now.";
        }
    }
    if (!displayError && isLinksError) {
        displayError = "Unable to load dashboard data right now.";
    }

    return (
        <Card className="h-full border-border/60 bg-card/75 shadow-[0_28px_90px_oklch(0.15_0_0/0.08)] backdrop-blur-xl">
            <CardHeader className="flex flex-col gap-3 border-b border-border/70 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <Badge
                        className="w-fit bg-primary/14 text-primary"
                        variant="secondary"
                    >
                        Dashboard
                    </Badge>
                    <CardTitle className="font-heading text-3xl leading-tight sm:text-4xl">
                        {currentUser ? `Welcome back, ${currentUser.email}` : "Links Overview"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Manage your short URLs, quickly toggle status, and
                        monitor click performance.
                    </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-right shadow-[inset_0_1px_0_oklch(1_0_0/0.7)] backdrop-blur">
                    <p className="text-xs tracking-[0.12em] uppercase text-muted-foreground">
                        Total clicks
                    </p>
                    <p className="mt-1 flex items-center justify-end gap-2 text-2xl font-semibold text-foreground">
                        <MousePointerClick className="h-5 w-5 text-primary" />
                        {safeLinksPage.totalClicks}
                    </p>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 px-0 pb-0 pt-3">
                {displayError ? (
                    <div className="mx-4 rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive sm:mx-6">
                        {displayError}
                    </div>
                ) : null}

                <div className="px-4 pb-1 sm:px-6" id="links">
                    <LinksDataTable
                        copiedLinkId={copiedLinkId}
                        isLoading={isLoading}
                        links={safeLinksPage.items}
                        onCopy={(link) => void handleCopyShortUrl(link)}
                        onToggle={(link) =>
                            toggleMutation.mutate({
                                linkId: link.id,
                                isActive: !link.isActive,
                            })
                        }
                        shortBaseUrl={SHORT_BASE_URL}
                        togglingLinkId={togglingLinkId}
                    />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 px-4 py-4 sm:px-6">
                    <p className="text-sm text-muted-foreground">
                        Showing {pageStart}-{pageEnd} of {safeLinksPage.total}
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            disabled={!canGoPrev || isRefreshingPage}
                            onClick={() => setPage((current) => current - 1)}
                            size="sm"
                            variant="outline"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Prev
                        </Button>

                        <span className="min-w-24 text-center text-sm text-muted-foreground">
                            Page {page} of {Math.max(safeLinksPage.totalPages, 1)}
                        </span>

                        <Button
                            disabled={!canGoNext || isRefreshingPage}
                            onClick={() => setPage((current) => current + 1)}
                            size="sm"
                            variant="outline"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
