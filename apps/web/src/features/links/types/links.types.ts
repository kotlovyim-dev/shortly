export type LinkSummary = {
    id: string;
    shortCode: string;
    originalUrl: string;
    title: string | null;
    clicks: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type LinksPageResponse = {
    items: LinkSummary[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    totalClicks: number;
};
