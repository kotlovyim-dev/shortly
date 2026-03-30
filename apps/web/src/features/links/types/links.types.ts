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

export type CreateLinkPayload = {
    originalUrl: string;
    title?: string;
    customSlug?: string;
    expiresAt?: string;
};

export type UpdateLinkPayload = {
    title?: string;
    isActive?: boolean;
    expiresAt?: string;
};

export type CreatedLinkResponse = {
    id: string;
    shortCode: string;
    originalUrl: string;
    title: string | null;
    expiresAt: string | null;
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
