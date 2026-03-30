"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateLinkRequest } from "@/features/links/api/links.api";
import { DatePickerField } from "@/features/links/components/date-picker-field";
import {
    linkModalSchema,
    type LinkModalValues,
} from "@/features/links/schemas/links-modal.schema";
import { getApiErrorMessage } from "@/lib/api-error";

type UpdateLinkModalProps = {
    linkId: string;
    initialValues: {
        originalUrl: string;
        title: string;
        customSlug: string;
        expiresAt: string;
    };
    onSuccess?: () => void;
};

export function UpdateLinkModal({
    linkId,
    initialValues,
    onSuccess,
}: UpdateLinkModalProps) {
    const queryClient = useQueryClient();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const form = useForm<LinkModalValues>({
        resolver: zodResolver(linkModalSchema),
        defaultValues: initialValues,
    });

    const updateMutation = useMutation({
        mutationFn: (values: LinkModalValues) =>
            updateLinkRequest(linkId, {
                title: values.title || undefined,
                expiresAt: values.expiresAt
                    ? new Date(values.expiresAt).toISOString()
                    : undefined,
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["links"] });
            setErrorMessage(null);
            onSuccess?.();
        },
        onError: async (error) => {
            const message = await getApiErrorMessage(
                error,
                "Failed to update link. Please try again.",
            );
            setErrorMessage(message);
        },
    });

    const handleSubmit = form.handleSubmit((values) => {
        setErrorMessage(null);
        updateMutation.mutate(values);
    });

    return (
        <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
                <label
                    className="text-sm font-medium text-foreground"
                    htmlFor="originalUrl"
                >
                    Original URL
                </label>
                <Input
                    disabled
                    id="originalUrl"
                    {...form.register("originalUrl")}
                />
                <p className="text-xs text-muted-foreground">
                    Original URL and custom slug cannot be edited yet.
                </p>
            </div>

            <div className="space-y-2">
                <label
                    className="text-sm font-medium text-foreground"
                    htmlFor="title"
                >
                    Title
                </label>
                <Input id="title" {...form.register("title")} />
                {form.formState.errors.title ? (
                    <p className="text-xs text-destructive">
                        {form.formState.errors.title.message}
                    </p>
                ) : null}
            </div>

            <div className="space-y-2">
                <label
                    className="text-sm font-medium text-foreground"
                    htmlFor="customSlug"
                >
                    Custom slug
                </label>
                <Input
                    disabled
                    id="customSlug"
                    {...form.register("customSlug")}
                />
            </div>

            <div className="space-y-2">
                <DatePickerField
                    id="expiresAt"
                    label="Expires at"
                    onChange={(nextValue) =>
                        form.setValue("expiresAt", nextValue, {
                            shouldDirty: true,
                            shouldValidate: true,
                        })
                    }
                    value={form.watch("expiresAt")}
                />
                {form.formState.errors.expiresAt ? (
                    <p className="text-xs text-destructive">
                        {form.formState.errors.expiresAt.message}
                    </p>
                ) : null}
            </div>

            {errorMessage ? (
                <div className="rounded-lg border border-destructive/25 bg-destructive/8 px-3 py-2 text-sm text-destructive">
                    {errorMessage}
                </div>
            ) : null}

            <div>
                <Button
                    className="h-12 w-full px-6 text-base font-semibold"
                    disabled={updateMutation.isPending}
                    type="submit"
                >
                    {updateMutation.isPending ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : null}
                    Save changes
                </Button>
            </div>
        </form>
    );
}
