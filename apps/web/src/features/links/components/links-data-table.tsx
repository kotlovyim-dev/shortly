"use client";

import { Check, Copy, LoaderCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { LinkSummary } from "@/features/links/types/links.types";

type LinksDataTableProps = {
    links: LinkSummary[];
    isLoading: boolean;
    shortBaseUrl: string;
    copiedLinkId: string | null;
    togglingLinkId: string | null;
    onCopy: (link: LinkSummary) => void;
    onToggle: (link: LinkSummary) => void;
};

export function LinksDataTable({
    links,
    isLoading,
    shortBaseUrl,
    copiedLinkId,
    togglingLinkId,
    onCopy,
    onToggle,
}: LinksDataTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow className="border-border/70">
                    <TableHead>Short URL</TableHead>
                    <TableHead>Original URL</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell className="py-8 text-center text-muted-foreground" colSpan={5}>
                            <span className="inline-flex items-center gap-2">
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                Loading links...
                            </span>
                        </TableCell>
                    </TableRow>
                ) : links.length === 0 ? (
                    <TableRow>
                        <TableCell className="py-8 text-center text-muted-foreground" colSpan={5}>
                            No links found yet.
                        </TableCell>
                    </TableRow>
                ) : (
                    links.map((link) => {
                        const shortUrl = `${shortBaseUrl}/${link.shortCode}`;
                        const isCopied = copiedLinkId === link.id;
                        const isToggling = togglingLinkId === link.id;

                        return (
                            <TableRow key={link.id} className="border-border/70">
                                <TableCell>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-medium text-foreground">
                                            {shortUrl}
                                        </span>
                                        <Button
                                            aria-label={`Copy ${shortUrl}`}
                                            className="h-7 rounded-lg"
                                            onClick={() => onCopy(link)}
                                            size="sm"
                                            variant="outline"
                                        >
                                            {isCopied ? (
                                                <>
                                                    <Check className="h-3.5 w-3.5" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-3.5 w-3.5" />
                                                    Copy
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </TableCell>

                                <TableCell className="max-w-92">
                                    <span
                                        className="block truncate text-muted-foreground"
                                        title={link.originalUrl}
                                    >
                                        {link.originalUrl}
                                    </span>
                                </TableCell>

                                <TableCell className="font-medium text-foreground">
                                    {link.clicks}
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <button
                                            aria-checked={link.isActive}
                                            aria-label={`Toggle link ${shortUrl}`}
                                            className="relative inline-flex h-6 w-11 items-center rounded-full border border-border/70 bg-muted transition-colors aria-checked:bg-primary disabled:cursor-not-allowed disabled:opacity-55"
                                            disabled={isToggling}
                                            onClick={() => onToggle(link)}
                                            role="switch"
                                            type="button"
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 rounded-full bg-background shadow transition-transform ${link.isActive ? "translate-x-5" : "translate-x-1"}`}
                                            />
                                        </button>

                                        <Badge
                                            className={link.isActive ? "bg-emerald-500/12 text-emerald-600" : "bg-muted text-muted-foreground"}
                                            variant="secondary"
                                        >
                                            {link.isActive ? "Active" : "Paused"}
                                        </Badge>
                                    </div>
                                </TableCell>

                                <TableCell className="text-muted-foreground">
                                    {new Date(link.createdAt).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        );
                    })
                )}
            </TableBody>
        </Table>
    );
}
