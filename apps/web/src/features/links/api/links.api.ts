import { api } from "@/lib/api";
import type {
    CreateLinkPayload,
    CreatedLinkResponse,
    LinksPageResponse,
    UpdateLinkPayload,
} from "@/features/links/types/links.types";

type ListLinksQuery = {
    page: number;
    limit: number;
};

export async function listLinksRequest(
    query: ListLinksQuery,
): Promise<LinksPageResponse> {
    return api
        .get("api/links", {
            searchParams: query,
        })
        .json<LinksPageResponse>();
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
