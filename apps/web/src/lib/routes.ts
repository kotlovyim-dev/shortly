export const routes = {
    home: "/",
    auth: {
        login: "/login",
        register: "/register",
    },
    dashboard: {
        home: "/dashboard",
        link: (id: string) => `/dashboard/links/${id}`,
    },
} as const;
