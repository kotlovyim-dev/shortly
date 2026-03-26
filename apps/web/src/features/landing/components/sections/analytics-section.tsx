"use client";

import dynamic from "next/dynamic";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { topCountries } from "@/features/landing/data";

const ClicksChart = dynamic(
    () =>
        import("@/features/landing/components/sections/clicks-chart").then(
            (mod) => mod.ClicksChart,
        ),
    {
        ssr: false,
        loading: () => <div className="h-full w-full rounded-xl bg-muted/60" />,
    },
);

export function AnalyticsSection() {
    return (
        <section className="rounded-3xl border border-border/70 bg-card/60 p-6 shadow-[0_24px_90px_oklch(0.15_0_0_/_0.06)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        Real-time insights, no clutter
                    </h2>
                    <p className="mt-2 max-w-2xl text-base text-muted-foreground">
                        Track performance by country, platform, and device in
                        one view.
                    </p>
                </div>
                <Badge className="bg-primary/15 text-primary">
                    +174 clicks today
                </Badge>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
                <Card className="rounded-2xl border-border/70 bg-background/75 py-6 backdrop-blur-xl">
                    <CardHeader className="px-6">
                        <CardTitle>Hourly clicks</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64 px-6">
                        <ClicksChart />
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-border/70 bg-background/75 py-6 backdrop-blur-xl">
                    <CardHeader className="px-6">
                        <CardTitle>Top countries</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5 px-6">
                        {topCountries.map((item, index) => (
                            <div key={item.country}>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">
                                        {item.country}
                                    </span>
                                    <span className="text-muted-foreground">
                                        {item.trafficShare}
                                    </span>
                                </div>
                                {index < topCountries.length - 1 && (
                                    <Separator className="mt-3" />
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
