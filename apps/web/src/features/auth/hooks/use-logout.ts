import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { logoutRequest } from "@/features/auth/api/auth.api";
import { routes } from "@/lib/routes";

export function useLogout() {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useCallback(async () => {
        try {
            await logoutRequest();
        } finally {
            // Leave the dashboard even if the server call fails; cookies may already be gone.
            queryClient.clear();
            router.replace(routes.auth.login);
        }
    }, [queryClient, router]);
}
