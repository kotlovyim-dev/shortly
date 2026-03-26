export const productHighlights = [
    {
        title: "Smart Short Links",
        description: "Turn any long URL into a clean, shareable short link.",
        value: "Fast publishing",
        icon: "link",
    },
    {
        title: "Live Audience Signals",
        description: "See clicks in real time across countries and platforms.",
        value: "Realtime data",
        icon: "pulse",
    },
    {
        title: "Clean Analytics Dashboard",
        description: "Read key metrics quickly with clear charts and trends.",
        value: "Clear metrics",
        icon: "layout",
    },
] as const;

export const clicksByHour = [
    { hour: "09:00", clicks: 44 },
    { hour: "10:00", clicks: 71 },
    { hour: "11:00", clicks: 68 },
    { hour: "12:00", clicks: 96 },
    { hour: "13:00", clicks: 118 },
    { hour: "14:00", clicks: 136 },
    { hour: "15:00", clicks: 131 },
    { hour: "16:00", clicks: 157 },
    { hour: "17:00", clicks: 174 },
] as const;

export const topCountries = [
    { country: "Ukraine", trafficShare: "31%" },
    { country: "Poland", trafficShare: "18%" },
    { country: "Germany", trafficShare: "14%" },
] as const;
