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
        <section className="space-y-5">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    Built for fast link campaigns
                </h2>
                <p className="max-w-2xl text-base text-muted-foreground">
                    One clear flow: shorten, share, measure.
                </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
                {productHighlights.map((item) => {
                    const Icon = icons[item.icon];

                    return (
                        <Card
                            key={item.title}
                            className="rounded-2xl border-border/70 bg-card/70 py-6 shadow-[0_14px_40px_oklch(0.15_0_0_/_0.05)] backdrop-blur-xl"
                        >
                            <CardHeader className="px-6">
                                <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                                    <Icon className="size-5" />
                                </div>
                                <CardTitle>{item.title}</CardTitle>
                                <CardDescription>{item.value}</CardDescription>
                            </CardHeader>
                            <CardContent className="px-6">
                                <p className="text-sm leading-relaxed text-muted-foreground">
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
