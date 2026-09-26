"use client";

import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SHORT_BASE_URL } from "@/config";
import {
    getLinkRequest,
    getLinkStatsRequest,
    getLinkTimelineRequest,
} from "@/features/links/api/links.api";
import type {
    CountEntry,
    TimelineDays,
} from "@/features/links/types/links.types";
import { routes } from "@/lib/routes";

const TIMELINE_RANGES: TimelineDays[] = [7, 30, 90];

const cardClassName =
    "rounded-2xl border border-border/60 bg-card/74 shadow-[0_24px_70px_oklch(0.15_0_0/0.08)] backdrop-blur-xl sm:rounded-3xl";

export function LinkAnalyticsPage({ linkId }: { linkId: string }) {
    const [days, setDays] = useState<TimelineDays>(7);

    const linkQuery = useQuery({
        queryKey: ["link", linkId],
        queryFn: () => getLinkRequest(linkId),
        retry: false,
    });
    const statsQuery = useQuery({
        queryKey: ["link", linkId, "stats"],
        queryFn: () => getLinkStatsRequest(linkId),
        enabled: linkQuery.isSuccess,
    });
    const timelineQuery = useQuery({
        queryKey: ["link", linkId, "timeline", days],
        queryFn: () => getLinkTimelineRequest(linkId, days),
        enabled: linkQuery.isSuccess,
        placeholderData: (previous) => previous,
    });

    const backLink = (
        <Link
            className={buttonVariants({ variant: "outline", size: "sm" })}
            href={routes.dashboard.home}
        >
            <ArrowLeft />
            Back to links
        </Link>
    );

    if (linkQuery.isError || statsQuery.isError) {
        return (
            <Card className={cardClassName}>
                <CardContent className="space-y-4 py-8">
                    <p className="text-sm text-destructive">
                        This link could not be loaded. It may have been deleted.
                    </p>
                    {backLink}
                </CardContent>
            </Card>
        );
    }

    const link = linkQuery.data;
    const stats = statsQuery.data;

    if (!link || !stats) {
        return (
            <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Loading analytics...
            </div>
        );
    }

    const shortUrl = `${SHORT_BASE_URL}/${link.shortCode}`;

    return (
        <div className="space-y-4 pb-6">
            <Card className={cardClassName}>
                <CardHeader className="gap-3 px-4 py-5 sm:px-6">
                    <div className="flex flex-wrap items-center gap-2">
                        {backLink}
                        <Badge
                            className={
                                link.isActive
                                    ? "bg-emerald-500/12 text-emerald-600"
                                    : "bg-muted text-muted-foreground"
                            }
                            variant="secondary"
                        >
                            {link.isActive ? "Active" : "Paused"}
                        </Badge>
                    </div>
                    <CardTitle className="font-heading text-2xl break-all sm:text-3xl">
                        {link.title ?? shortUrl}
                    </CardTitle>
                    <div className="space-y-1 text-sm text-muted-foreground">
                        <p className="break-all">
                            <span className="font-medium text-foreground">
                                {shortUrl}
                            </span>
                        </p>
                        <p className="break-all">→ {link.originalUrl}</p>
                        {link.expiresAt ? (
                            <p>
                                Expires{" "}
                                {format(parseISO(link.expiresAt), "PPp")}
                            </p>
                        ) : null}
                    </div>
                </CardHeader>
            </Card>

            <div className="grid gap-4 sm:grid-cols-3">
                <StatTile label="Total clicks" value={stats.totalClicks} />
                <StatTile
                    label="Unique visitors"
                    value={stats.uniqueVisitors}
                />
                <StatTile label="Clicks today" value={stats.clicksToday} />
            </div>

            <Card className={cardClassName}>
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
                    <CardTitle className="text-lg">Clicks over time</CardTitle>
                    <div
                        aria-label="Timeline range"
                        className="flex gap-1"
                        role="group"
                    >
                        {TIMELINE_RANGES.map((range) => (
                            <button
                                aria-pressed={days === range}
                                className={buttonVariants({
                                    variant:
                                        days === range ? "default" : "outline",
                                    size: "sm",
                                })}
                                key={range}
                                onClick={() => setDays(range)}
                                type="button"
                            >
                                {range}d
                            </button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="h-72 px-2 sm:px-4">
                    <ResponsiveContainer height="100%" width="100%">
                        <AreaChart
                            data={timelineQuery.data ?? []}
                            margin={{ left: 0, right: 8, top: 8 }}
                        >
                            <defs>
                                <linearGradient
                                    id="link-clicks-gradient"
                                    x1="0"
                                    x2="0"
                                    y1="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="var(--color-primary)"
                                        stopOpacity={0.45}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="var(--color-primary)"
                                        stopOpacity={0.03}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                stroke="var(--color-border)"
                                strokeDasharray="3 3"
                                vertical={false}
                            />
                            <XAxis
                                axisLine={false}
                                dataKey="date"
                                dy={8}
                                minTickGap={24}
                                tick={{
                                    fill: "var(--color-muted-foreground)",
                                    fontSize: 12,
                                }}
                                tickFormatter={(date: string) =>
                                    format(parseISO(date), "MMM d")
                                }
                                tickLine={false}
                            />
                            <YAxis
                                allowDecimals={false}
                                axisLine={false}
                                tick={{
                                    fill: "var(--color-muted-foreground)",
                                    fontSize: 12,
                                }}
                                tickLine={false}
                                width={32}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: 12,
                                    border: "1px solid var(--color-border)",
                                    background: "var(--color-card)",
                                    color: "var(--color-foreground)",
                                }}
                                cursor={{
                                    stroke: "var(--color-primary)",
                                    strokeOpacity: 0.25,
                                }}
                                labelFormatter={(date) =>
                                    format(parseISO(String(date)), "PP")
                                }
                            />
                            <Area
                                dataKey="clicks"
                                fill="url(#link-clicks-gradient)"
                                stroke="var(--color-primary)"
                                strokeWidth={2.5}
                                type="linear"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                <Breakdown entries={stats.topReferrers} title="Top referrers" />
                <Breakdown entries={stats.topCountries} title="Top countries" />
                <Breakdown entries={stats.devices} title="Devices" />
                <Breakdown entries={stats.browsers} title="Browsers" />
            </div>
        </div>
    );
}

function StatTile({ label, value }: { label: string; value: number }) {
    return (
        <Card className={cardClassName}>
            <CardContent className="space-y-1 py-5">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-heading text-3xl font-semibold tabular-nums">
                    {value.toLocaleString()}
                </p>
            </CardContent>
        </Card>
    );
}

function Breakdown({
    title,
    entries,
}: {
    title: string;
    entries: CountEntry[];
}) {
    const max = Math.max(1, ...entries.map((entry) => entry.count));

    return (
        <Card className={cardClassName}>
            <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 sm:px-6">
                {entries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No clicks yet.
                    </p>
                ) : (
                    entries.map((entry) => (
                        <div className="space-y-1" key={entry.value}>
                            <div className="flex justify-between gap-3 text-sm">
                                <span className="truncate">{entry.value}</span>
                                <span className="font-medium tabular-nums">
                                    {entry.count}
                                </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-primary"
                                    style={{
                                        width: `${(entry.count / max) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
