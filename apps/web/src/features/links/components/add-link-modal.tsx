"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { SHORT_BASE_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createLinkRequest } from "@/features/links/api/links.api";
import { DatePickerField } from "@/features/links/components/date-picker-field";
import {
    linkModalSchema,
    type LinkModalValues,
} from "@/features/links/schemas/links-modal.schema";
import { getApiErrorMessage } from "@/lib/api-error";

type AddLinkModalProps = {
    onSuccess?: () => void;
};

export function AddLinkModal({ onSuccess }: AddLinkModalProps) {
    const queryClient = useQueryClient();
    const [createdShortUrl, setCreatedShortUrl] = useState<string | null>(null);
    const [isCopiedResult, setIsCopiedResult] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const form = useForm<LinkModalValues>({
        resolver: zodResolver(linkModalSchema),
        defaultValues: {
            originalUrl: "",
            title: "",
            customSlug: "",
            expiresAt: "",
        },
    });

    const createMutation = useMutation({
        mutationFn: createLinkRequest,
        onSuccess: async (createdLink) => {
            await queryClient.invalidateQueries({ queryKey: ["links"] });
            const shortUrl = `${SHORT_BASE_URL}/${createdLink.shortCode}`;
            setCreatedShortUrl(shortUrl);
            setIsCopiedResult(false);
            setErrorMessage(null);
            onSuccess?.();
        },
        onError: async (error) => {
            const message = await getApiErrorMessage(
                error,
                "Failed to create link. Please check your data and try again.",
            );
            setErrorMessage(message);
        },
    });

    const handleSubmit = form.handleSubmit((values) => {
        setErrorMessage(null);
        createMutation.mutate({
            originalUrl: values.originalUrl,
            title: values.title || undefined,
            customSlug: values.customSlug || undefined,
            expiresAt: values.expiresAt
                ? new Date(values.expiresAt).toISOString()
                : undefined,
        });
    });

    const handleCopyResult = async () => {
        if (!createdShortUrl) {
            return;
        }

        await navigator.clipboard.writeText(createdShortUrl);
        setIsCopiedResult(true);
        window.setTimeout(() => setIsCopiedResult(false), 1200);
    };

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
                    id="originalUrl"
                    placeholder="https://example.com"
                    {...form.register("originalUrl")}
                />
                {form.formState.errors.originalUrl ? (
                    <p className="text-xs text-destructive">
                        {form.formState.errors.originalUrl.message}
                    </p>
                ) : null}
            </div>

            <div className="space-y-2">
                <label
                    className="text-sm font-medium text-foreground"
                    htmlFor="title"
                >
                    Title
                </label>
                <Input
                    id="title"
                    placeholder="Campaign page"
                    {...form.register("title")}
                />
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
                    id="customSlug"
                    placeholder="spring-sale"
                    {...form.register("customSlug")}
                />
                {form.formState.errors.customSlug ? (
                    <p className="text-xs text-destructive">
                        {form.formState.errors.customSlug.message}
                    </p>
                ) : null}
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

            {createdShortUrl ? (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/8 p-3">
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-emerald-700">
                        Short URL created
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <p className="text-sm text-foreground">
                            {createdShortUrl}
                        </p>
                        <Button
                            onClick={handleCopyResult}
                            size="sm"
                            type="button"
                            variant="outline"
                        >
                            {isCopiedResult ? (
                                <Check className="h-3.5 w-3.5" />
                            ) : (
                                <Copy className="h-3.5 w-3.5" />
                            )}
                            {isCopiedResult ? "Copied" : "Copy"}
                        </Button>
                    </div>
                </div>
            ) : null}

            <div>
                <Button
                    className="h-12 w-full px-6 text-base font-semibold"
                    disabled={createMutation.isPending}
                    type="submit"
                >
                    {createMutation.isPending ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : null}
                    Create link
                </Button>
            </div>
        </form>
    );
}
