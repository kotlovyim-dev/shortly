"use client";

import * as React from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type ResponsiveDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: React.ReactNode;
    description?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
};

export function ResponsiveDialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    className,
}: ResponsiveDialogProps) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent
                    className={cn(
                        "h-auto max-h-[90svh] overflow-y-auto",
                        className,
                    )}
                >
                    <DrawerHeader className="px-6 pt-6 text-left">
                        <DrawerTitle className="text-xl font-semibold">
                            {title}
                        </DrawerTitle>
                        {description ? (
                            <DrawerDescription>{description}</DrawerDescription>
                        ) : null}
                    </DrawerHeader>
                    <div className="px-6 pb-6">{children}</div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn("p-6 sm:max-w-xl", className)}>
                <DialogHeader className="gap-2">
                    <DialogTitle className="text-2xl font-semibold">
                        {title}
                    </DialogTitle>
                    {description ? (
                        <DialogDescription>{description}</DialogDescription>
                    ) : null}
                </DialogHeader>
                <div className="mt-2">{children}</div>
            </DialogContent>
        </Dialog>
    );
}
