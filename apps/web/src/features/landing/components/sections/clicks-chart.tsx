"use client";

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
} from "recharts";

import { clicksByHour } from "@/features/landing/data";

export function ClicksChart() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={clicksByHour} margin={{ left: 4, right: 8 }}>
                <defs>
                    <linearGradient id="clicks-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.03} />
                    </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis
                    dataKey="hour"
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                    tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                />
                <Tooltip
                    cursor={{ stroke: "var(--color-primary)", strokeOpacity: 0.25 }}
                    contentStyle={{
                        borderRadius: 12,
                        border: "1px solid var(--color-border)",
                        background: "var(--color-card)",
                        color: "var(--color-foreground)",
                    }}
                />
                <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    fill="url(#clicks-gradient)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
