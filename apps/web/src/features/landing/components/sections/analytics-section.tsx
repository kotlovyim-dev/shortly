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
        <section className="rounded-3xl border border-border/70 bg-card/60 p-8 shadow-[0_24px_90px_oklch(0.15_0_0/0.06)] backdrop-blur-xl sm:p-10 lg:p-12">
            <div className="mb-9 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                        Real-time insights, no clutter
                    </h2>
                    <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
                        Track performance by country, platform, and device in
                        one view.
                    </p>
                </div>
                <Badge className="bg-primary/15 px-4 py-1.5 text-sm text-primary">
                    +174 clicks today
                </Badge>
            </div>

            <div className="grid gap-7 lg:grid-cols-[1.3fr_0.7fr] lg:gap-8">
                <Card className="rounded-3xl border-border/70 bg-background/75 py-8 backdrop-blur-xl">
                    <CardHeader className="px-8">
                        <CardTitle className="text-2xl">Hourly clicks</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80 px-8">
                        <ClicksChart />
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-border/70 bg-background/75 py-8 backdrop-blur-xl">
                    <CardHeader className="px-8">
                        <CardTitle className="text-2xl">Top countries</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 px-8">
                        {topCountries.map((item, index) => (
                            <div key={item.country}>
                                <div className="flex items-center justify-between text-lg">
                                    <span className="font-semibold">
                                        {item.country}
                                    </span>
                                    <span className="font-medium text-muted-foreground">
                                        {item.trafficShare}
                                    </span>
                                </div>
                                {index < topCountries.length - 1 && (
                                    <Separator className="mt-4" />
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
