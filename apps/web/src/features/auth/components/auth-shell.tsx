import type { ReactNode } from "react";

import Link from "next/link";
import Image from "next/image";

type AuthShellProps = {
    title: string;
    description: string;
    eyebrow: string;
    singleCard?: boolean;
    infoContent?: ReactNode;
    form: ReactNode;
    footer: ReactNode;
};

export function AuthShell({
    title,
    description,
    eyebrow,
    singleCard = false,
    infoContent,
    form,
    footer,
}: AuthShellProps) {
    return (
        <main className="relative h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_8%,#7d40ff_0%,#3e1f8a_34%,#24114f_58%,#140629_100%)] px-3 py-2 text-foreground sm:px-5 sm:py-3">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.24),transparent_32%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_84%,rgba(168,85,247,0.35),transparent_36%)]" />

            <div
                className={`auth-reveal mx-auto grid h-full w-full overflow-hidden rounded-[2rem] border border-white/25 bg-white/12 shadow-[0_28px_100px_rgba(8,3,25,0.45)] backdrop-blur-xl ${singleCard ? "max-w-2xl lg:grid-cols-1" : "max-w-7xl lg:grid-cols-[1.06fr_0.94fr]"}`}
            >
                {!singleCard ? (
                    <section className="relative hidden overflow-hidden p-7 text-white lg:flex lg:flex-col lg:p-8">
                        <Image
                            alt="Abstract colorful waves"
                            className="object-cover"
                            fill
                            priority
                            src="/auth.png"
                        />
                        <div className="absolute inset-0 bg-linear-to-br from-[#1f0d45]/45 via-[#12072b]/58 to-[#06020f]/84" />

                        <div className="relative z-10 flex h-full flex-col">
                            <div className="flex items-center gap-3 text-xs tracking-[0.3em] uppercase">
                                <span className="font-medium">
                                    Track Share Measure
                                </span>
                                <span className="h-px flex-1 bg-white/40" />
                            </div>

                            <div className="mt-auto max-w-sm space-y-5">
                                <h1 className="font-heading text-5xl leading-[0.96] font-semibold xl:text-6xl">
                                    Short Links
                                    <br />
                                    Big
                                    <br />
                                    Signals
                                </h1>
                                <p className="max-w-xs text-sm leading-relaxed text-white/85 sm:text-[15px]">
                                    Build brand-safe short links and understand
                                    every click with clean, real-time analytics.
                                </p>
                            </div>
                        </div>
                    </section>
                ) : null}

                <section className="relative flex items-center bg-white px-4 py-4 sm:px-7 sm:py-5 lg:px-12">
                    <div className="mx-auto flex h-full min-h-0 w-full max-w-md flex-col justify-between py-1 sm:py-2">
                        <div className="flex items-center justify-between gap-4">
                            <Link
                                className="text-sm font-semibold tracking-[0.22em] uppercase text-violet-950"
                                href="/"
                            >
                                Shortly
                            </Link>
                            <span className="sr-only">{eyebrow}</span>
                            <Link
                                className="text-sm text-violet-800/75 transition-colors hover:text-violet-950"
                                href="/"
                            >
                                Back to landing
                            </Link>
                        </div>

                        <div className="my-6 space-y-6 sm:my-8 sm:space-y-8">
                            <div className="space-y-4 text-center sm:space-y-5">
                                <h2 className="font-heading text-[2.7rem] leading-[1.02] font-semibold text-violet-950 sm:text-[3.2rem]">
                                    {title}
                                </h2>
                                <p className="mx-auto max-w-sm text-sm leading-relaxed text-violet-900/72 sm:text-base">
                                    {description}
                                </p>
                            </div>

                            {infoContent ? (
                                <div className="space-y-4">{infoContent}</div>
                            ) : null}

                            <div className="space-y-5 sm:space-y-6">{form}</div>
                        </div>

                        <div className="pt-3 sm:pt-4">{footer}</div>
                    </div>
                </section>
            </div>
        </main>
    );
}
