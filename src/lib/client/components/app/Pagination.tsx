import {Button} from "~/lib/client/components/ui/button";


interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}


export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
    const hasPrevious = page > 1;
    const hasNext = page < totalPages;

    return (
        <div className="flex items-center gap-2">
            <Button
                size="sm"
                type="button"
                variant="outline"
                disabled={!hasPrevious}
                onClick={() => onPageChange(page - 1)}
            >
                Previous
            </Button>
            <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
            </span>
            <Button
                size="sm"
                type="button"
                variant="outline"
                disabled={!hasNext}
                onClick={() => onPageChange(page + 1)}
            >
                Next
            </Button>
        </div>
    );
}
