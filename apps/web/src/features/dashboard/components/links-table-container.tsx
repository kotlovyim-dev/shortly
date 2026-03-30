"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { usePagination } from "@/common/hooks/use-pagination";
import { LINKS_PAGE_SIZE, SHORT_BASE_URL } from "@/config";
import type {
    LinksTableActions,
    LinksTableState,
} from "@/features/dashboard/components/links-table.types";
import {
    listLinksRequest,
    updateLinkActivityRequest,
} from "@/features/links/api/links.api";
import type { LinkSummary } from "@/features/links/types/links.types";
import { LinksTable } from "@/features/dashboard/components/links-table";
import { getApiErrorMessage } from "@/lib/api-error";

export function LinksTableContainer() {
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const copyTimeoutRef = useRef<number | null>(null);

    const {
        data: linksPage,
        isLoading: isLinksLoading,
        isFetching: isLinksFetching,
        isError: isLinksError,
        error: linksError,
    } = useQuery({
        queryKey: ["links", page],
        queryFn: () => listLinksRequest({ page, limit: LINKS_PAGE_SIZE }),
    });

    const safeLinksPage = linksPage ?? {
        items: [],
        page: 1,
        limit: LINKS_PAGE_SIZE,
        total: 0,
        totalPages: 0,
        totalClicks: 0,
    };

    const pagination = usePagination({
        page,
        setPage,
        pageSize: safeLinksPage.limit,
        totalItems: safeLinksPage.total,
        totalPages: safeLinksPage.totalPages,
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
        onError: async (error) => {
            const message = await getApiErrorMessage(
                error,
                "Failed to update link status.",
            );
            setActionError(message);
        },
    });

    const handleCopyShortUrl = useCallback(async (link: LinkSummary) => {
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
    }, []);

    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current !== null) {
                window.clearTimeout(copyTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        const syncQueryError = async () => {
            if (!isLinksError || actionError) {
                return;
            }

            const message = await getApiErrorMessage(
                linksError,
                "Unable to load links data right now.",
            );

            if (mounted) {
                setActionError(message);
            }
        };

        void syncQueryError();

        return () => {
            mounted = false;
        };
    }, [actionError, isLinksError, linksError]);

    const isLoading = isLinksLoading && !linksPage;
    const isRefreshingPage = isLinksFetching && !!linksPage;
    const togglingLinkId = toggleMutation.isPending
        ? toggleMutation.variables.linkId
        : null;

    const state: LinksTableState = {
        copiedLinkId,
        isLoading,
        links: safeLinksPage.items,
        pagination: {
            canGoNext: pagination.canGoNext,
            canGoPrev: pagination.canGoPrev,
            isRefreshingPage,
            page: pagination.page,
            pageEnd: pagination.pageEnd,
            pageStart: pagination.pageStart,
            total: safeLinksPage.total,
            totalPages: pagination.normalizedTotalPages,
        },
        shortBaseUrl: SHORT_BASE_URL,
        togglingLinkId,
        totalClicks: safeLinksPage.totalClicks,
    };

    const actions: LinksTableActions = {
        onCopy: (link) => {
            void handleCopyShortUrl(link);
        },
        onNextPage: pagination.goToNextPage,
        onPrevPage: pagination.goToPrevPage,
        onToggle: (link) => {
            toggleMutation.mutate({
                linkId: link.id,
                isActive: !link.isActive,
            });
        },
    };

    return (
        <>
            {actionError ? (
                <div className="mx-4 rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive sm:mx-6">
                    {actionError}
                </div>
            ) : null}

            <LinksTable actions={actions} state={state} />
        </>
    );
}
