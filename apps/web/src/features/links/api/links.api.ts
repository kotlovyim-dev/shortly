import { api } from "@/lib/api";
import type { LinksPageResponse } from "@/features/links/types/links.types";

type ListLinksQuery = {
    page: number;
    limit: number;
};

export async function listLinksRequest(
    query: ListLinksQuery,
): Promise<LinksPageResponse> {
    return api.get("api/links", {
        searchParams: query,
    }).json<LinksPageResponse>();
}

export async function updateLinkActivityRequest(
    linkId: string,
    isActive: boolean,
): Promise<void> {
    await api.patch(`api/links/${linkId}`, {
        json: { isActive },
    });
}
