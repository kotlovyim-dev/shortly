import { api } from "@/lib/api";
import type {
    CreateLinkPayload,
    CreatedLinkResponse,
    LinkStats,
    LinksPageResponse,
    TimelineDays,
    TimelinePoint,
    UpdateLinkPayload,
} from "@/features/links/types/links.types";

type ListLinksQuery = {
    page: number;
    limit: number;
    q?: string;
};

export async function listLinksRequest({
    q,
    ...query
}: ListLinksQuery): Promise<LinksPageResponse> {
    return api
        .get("api/links", {
            searchParams: q ? { ...query, q } : query,
        })
        .json<LinksPageResponse>();
}

export async function getLinkRequest(
    linkId: string,
): Promise<CreatedLinkResponse> {
    return api.get(`api/links/${linkId}`).json<CreatedLinkResponse>();
}

export async function getLinkStatsRequest(linkId: string): Promise<LinkStats> {
    return api.get(`api/links/${linkId}/stats`).json<LinkStats>();
}

export async function getLinkTimelineRequest(
    linkId: string,
    days: TimelineDays,
): Promise<TimelinePoint[]> {
    return api
        .get(`api/links/${linkId}/timeline`, { searchParams: { days } })
        .json<TimelinePoint[]>();
}

export async function createLinkRequest(
    payload: CreateLinkPayload,
): Promise<CreatedLinkResponse> {
    return api
        .post("api/links", {
            json: payload,
        })
        .json<CreatedLinkResponse>();
}

export async function updateLinkRequest(
    linkId: string,
    payload: UpdateLinkPayload,
): Promise<CreatedLinkResponse> {
    return api
        .patch(`api/links/${linkId}`, {
            json: payload,
        })
        .json<CreatedLinkResponse>();
}

export async function updateLinkActivityRequest(
    linkId: string,
    isActive: boolean,
): Promise<void> {
    await updateLinkRequest(linkId, { isActive });
}

export async function deleteLinkRequest(linkId: string): Promise<void> {
    await api.delete(`api/links/${linkId}`);
}
