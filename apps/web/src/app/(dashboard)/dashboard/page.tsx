"use client";

import { getCurrentUserRequest } from "@/features/auth/api/auth.api";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { useQuery } from "@tanstack/react-query";
import { HTTPError } from "ky";

export default function DashboardRoutePage() {
    const {
        data: currentUser,
        isError: isUserError,
        error: userError,
    } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUserRequest,
        retry: false,
    });

    let sessionError: string | null = null;
    if (isUserError) {
        if (
            !(
                userError instanceof HTTPError &&
                userError.response?.status === 401
            )
        ) {
            sessionError = "Unable to verify your session right now.";
        }
    }

    return (
        <DashboardPage
            currentUserEmail={currentUser?.email ?? null}
            sessionError={sessionError}
        />
    );
}
