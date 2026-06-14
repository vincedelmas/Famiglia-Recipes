import {useTranslation} from "react-i18next";
import {Button} from "~/lib/client/components/ui/button";


interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}


export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
    const hasPrevious = page > 1;
    const { t } = useTranslation();
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
                {t("previous-page")}
            </Button>
            <span className="text-sm text-muted-foreground">
                {t("page-of", { page, totalPages })}
            </span>
            <Button
                size="sm"
                type="button"
                variant="outline"
                disabled={!hasNext}
                onClick={() => onPageChange(page + 1)}
            >
                {t("next-page")}
            </Button>
        </div>
    );
}
