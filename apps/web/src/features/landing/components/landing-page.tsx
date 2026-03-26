import { AnalyticsSection } from "@/features/landing/components/sections/analytics-section";
import { CtaSection } from "@/features/landing/components/sections/cta-section";
import { HeroSection } from "@/features/landing/components/sections/hero-section";
import { HighlightsSection } from "@/features/landing/components/sections/highlights-section";

export function LandingPage() {
    return (
        <main className="relative overflow-hidden bg-background text-foreground">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,oklch(0.66_0.24_295/0.2),transparent_55%)]" />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,transparent,oklch(0.15_0_0/0.08))] dark:bg-[linear-gradient(to_bottom,transparent,oklch(0.99_0_0/0.06))]" />
            <HeroSection />

            <div className="flex w-full flex-col gap-14 px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
                <HighlightsSection />
                <AnalyticsSection />
                <CtaSection />
            </div>
        </main>
    );
}
