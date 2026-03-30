import type { LinkSummary } from "@/features/links/types/links.types";

export type LinksTablePagination = {
    page: number;
    total: number;
    pageStart: number;
    pageEnd: number;
    totalPages: number;
    canGoPrev: boolean;
    canGoNext: boolean;
    isRefreshingPage: boolean;
};

export type LinksTableActions = {
    onCopy: (link: LinkSummary) => void;
    onToggle: (link: LinkSummary) => void;
    onPrevPage: () => void;
    onNextPage: () => void;
};

export type LinksTableState = {
    links: LinkSummary[];
    isLoading: boolean;
    copiedLinkId: string | null;
    togglingLinkId: string | null;
    shortBaseUrl: string;
    totalClicks: number;
    pagination: LinksTablePagination;
};
