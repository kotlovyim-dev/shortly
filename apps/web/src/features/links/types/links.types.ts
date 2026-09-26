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

export type CountEntry = {
    value: string;
    count: number;
};

export type LinkStats = {
    totalClicks: number;
    uniqueVisitors: number;
    clicksToday: number;
    topCountries: CountEntry[];
    topReferrers: CountEntry[];
    devices: CountEntry[];
    browsers: CountEntry[];
};

export type TimelineDays = 7 | 30 | 90;

export type TimelinePoint = {
    date: string;
    clicks: number;
};
