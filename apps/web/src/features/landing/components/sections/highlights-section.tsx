import { Globe, LayoutDashboard, Link2 } from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { productHighlights } from "@/features/landing/data";

const icons = {
    link: Link2,
    pulse: Globe,
    layout: LayoutDashboard,
};

export function HighlightsSection() {
    return (
        <section className="space-y-8">
            <div className="space-y-3">
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    Built for fast link campaigns
                </h2>
                <p className="max-w-3xl text-lg text-muted-foreground">
                    One clear flow: shorten, share, measure.
                </p>
            </div>

            <div className="grid gap-7 md:grid-cols-3 lg:gap-8">
                {productHighlights.map((item) => {
                    const Icon = icons[item.icon];

                    return (
                        <Card
                            key={item.title}
                            className="min-h-72 rounded-3xl border-border/70 bg-card/70 py-8 shadow-[0_18px_48px_oklch(0.15_0_0/0.06)] backdrop-blur-xl"
                        >
                            <CardHeader className="gap-2 px-8">
                                <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                                    <Icon className="size-6" />
                                </div>
                                <CardTitle className="text-3xl/9 sm:text-[1.75rem]">
                                    {item.title}
                                </CardTitle>
                                <CardDescription className="text-base">
                                    {item.value}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="mt-2 px-8">
                                <p className="text-base leading-relaxed text-muted-foreground">
                                    {item.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
}
