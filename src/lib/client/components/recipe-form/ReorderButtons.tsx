import {ArrowDown, ArrowUp} from "lucide-react";
import {useTranslation} from "react-i18next";
import {Button} from "~/lib/client/components/ui/button";

interface ReorderButtonsProps {
    index: number;
    count: number;
    item: string;
    onMove: (from: number, to: number) => void;
}

export function ReorderButtons({index, count, item, onMove}: ReorderButtonsProps) {
    const {t} = useTranslation();
    return <div className="flex shrink-0 flex-col gap-1">
        <Button type="button" variant="ghost" size="icon-sm" disabled={index === 0} aria-label={t("ui.move-up", {item})} title={t("ui.move-up", {item})} onClick={() => onMove(index, index - 1)}><ArrowUp/></Button>
        <Button type="button" variant="ghost" size="icon-sm" disabled={index === count - 1} aria-label={t("ui.move-down", {item})} title={t("ui.move-down", {item})} onClick={() => onMove(index, index + 1)}><ArrowDown/></Button>
    </div>;
}
