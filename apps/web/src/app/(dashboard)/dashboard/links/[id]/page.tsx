"use client";

import { useParams } from "next/navigation";

import { LinkAnalyticsPage } from "@/features/links/components/link-analytics-page";

export default function LinkAnalyticsRoutePage() {
    const { id } = useParams<{ id: string }>();

    return <LinkAnalyticsPage linkId={id} />;
}
