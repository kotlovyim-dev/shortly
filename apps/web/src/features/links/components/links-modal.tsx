"use client";

import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { AddLinkModal } from "@/features/links/components/add-link-modal";
import { UpdateLinkModal } from "@/features/links/components/update-link-modal";

type LinksModalProps = {
    variant: "add" | "update";
    open: boolean;
    onOpenChange: (open: boolean) => void;
    updatePayload?: {
        linkId: string;
        initialValues: {
            originalUrl: string;
            title: string;
            customSlug: string;
            expiresAt: string;
        };
    };
};

export function LinksModal({
    variant,
    open,
    onOpenChange,
    updatePayload,
}: LinksModalProps) {
    const isAdd = variant === "add";

    return (
        <ResponsiveDialog
            description={
                isAdd
                    ? "Create a new short link with optional slug and expiry."
                    : "Update title and expiry settings for this link."
            }
            onOpenChange={onOpenChange}
            open={open}
            title={isAdd ? "Add link" : "Update link"}
        >
            {isAdd ? (
                <AddLinkModal />
            ) : updatePayload ? (
                <UpdateLinkModal
                    initialValues={updatePayload.initialValues}
                    linkId={updatePayload.linkId}
                />
            ) : null}
        </ResponsiveDialog>
    );
}
