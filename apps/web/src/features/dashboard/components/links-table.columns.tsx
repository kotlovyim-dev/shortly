import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LinkSummary } from "@/features/links/types/links.types";
import type { LinksTableActions } from "@/features/dashboard/components/links-table.types";

type CreateLinksTableColumnsOptions = {
    copiedLinkId: string | null;
    togglingLinkId: string | null;
    shortBaseUrl: string;
    actions: Pick<LinksTableActions, "onCopy" | "onToggle">;
};

export function createLinksTableColumns({
    copiedLinkId,
    togglingLinkId,
    shortBaseUrl,
    actions,
}: CreateLinksTableColumnsOptions): ColumnDef<LinkSummary>[] {
    return [
        {
            id: "shortUrl",
            header: "Short URL",
            cell: ({ row }) => {
                const link = row.original;
                const shortUrl = `${shortBaseUrl}/${link.shortCode}`;
                const isCopied = copiedLinkId === link.id;

                return (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">
                            {shortUrl}
                        </span>
                        <Button
                            aria-label={`Copy ${shortUrl}`}
                            className="h-7 rounded-lg"
                            onClick={() => actions.onCopy(link)}
                            size="sm"
                            variant="outline"
                        >
                            {isCopied ? "Copied" : "Copy"}
                        </Button>
                    </div>
                );
            },
        },
        {
            accessorKey: "originalUrl",
            header: "Original URL",
            cell: ({ row }) => (
                <span
                    className="block truncate text-muted-foreground"
                    title={row.original.originalUrl}
                >
                    {row.original.originalUrl}
                </span>
            ),
        },
        {
            accessorKey: "clicks",
            header: "Clicks",
            cell: ({ row }) => (
                <span className="font-medium text-foreground">
                    {row.original.clicks}
                </span>
            ),
        },
        {
            id: "status",
            header: "Status",
            cell: ({ row }) => {
                const link = row.original;
                const shortUrl = `${shortBaseUrl}/${link.shortCode}`;
                const isToggling = togglingLinkId === link.id;

                return (
                    <div className="flex items-center gap-2">
                        <button
                            aria-checked={link.isActive}
                            aria-label={`Toggle link ${shortUrl}`}
                            className="relative inline-flex h-6 w-11 items-center rounded-full border border-border/70 bg-muted transition-colors aria-checked:bg-primary disabled:cursor-not-allowed disabled:opacity-55"
                            disabled={isToggling}
                            onClick={() => actions.onToggle(link)}
                            role="switch"
                            type="button"
                        >
                            <span
                                className={`inline-block h-4 w-4 rounded-full bg-background shadow transition-transform ${link.isActive ? "translate-x-5" : "translate-x-1"}`}
                            />
                        </button>

                        <Badge
                            className={
                                link.isActive
                                    ? "bg-emerald-500/12 text-emerald-600"
                                    : "bg-muted text-muted-foreground"
                            }
                            variant="secondary"
                        >
                            {link.isActive ? "Active" : "Paused"}
                        </Badge>
                    </div>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {new Date(row.original.createdAt).toLocaleDateString()}
                </span>
            ),
        },
    ];
}
