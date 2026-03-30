import { useCallback, useEffect, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";

type UsePaginationOptions = {
    page: number;
    setPage: Dispatch<SetStateAction<number>>;
    pageSize: number;
    totalItems: number;
    totalPages?: number;
};

type UsePaginationResult = {
    page: number;
    canGoPrev: boolean;
    canGoNext: boolean;
    goToPrevPage: () => void;
    goToNextPage: () => void;
    pageStart: number;
    pageEnd: number;
    normalizedTotalPages: number;
};

export function usePagination({
    page,
    setPage,
    pageSize,
    totalItems,
    totalPages,
}: UsePaginationOptions): UsePaginationResult {
    const normalizedTotalPages = useMemo(() => {
        const computedTotalPages =
            totalPages ?? Math.ceil(totalItems / Math.max(pageSize, 1));
        return Math.max(computedTotalPages, 1);
    }, [pageSize, totalItems, totalPages]);

    useEffect(() => {
        if (page > normalizedTotalPages) {
            setPage(normalizedTotalPages);
        }
    }, [page, normalizedTotalPages]);

    const canGoPrev = page > 1;
    const canGoNext = page < normalizedTotalPages;

    const goToPrevPage = useCallback(() => {
        setPage((currentPage) => Math.max(currentPage - 1, 1));
    }, []);

    const goToNextPage = useCallback(() => {
        setPage((currentPage) =>
            Math.min(currentPage + 1, normalizedTotalPages),
        );
    }, [normalizedTotalPages]);

    const pageStart = useMemo(() => {
        if (totalItems === 0) {
            return 0;
        }

        return (page - 1) * pageSize + 1;
    }, [page, pageSize, totalItems]);

    const pageEnd = useMemo(() => {
        if (totalItems === 0) {
            return 0;
        }

        return Math.min(page * pageSize, totalItems);
    }, [page, pageSize, totalItems]);

    return {
        page,
        canGoPrev,
        canGoNext,
        goToPrevPage,
        goToNextPage,
        pageStart,
        pageEnd,
        normalizedTotalPages,
    };
}
