import {useGT} from "gt-react";
import {ArrowDown, ArrowUp} from "lucide-react";
import {Button} from "~/lib/client/components/ui/button";


interface ReorderButtonsProps {
    index: number;
    count: number;
    item: string;
    onMove: (from: number, to: number) => void;
}


export function ReorderButtons({ index, count, item, onMove }: ReorderButtonsProps) {
    const gt = useGT();

    return (
        <div className="flex shrink-0 flex-col gap-1">
            <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                disabled={index === 0}
                title={gt("Move {item} up", { item })}
                aria-label={gt("Move {item} up", { item })}
                onClick={() => onMove(index, index - 1)}
            >
                <ArrowUp/>
            </Button>

            <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                disabled={index === count - 1}
                title={gt("Move {item} down", { item })}
                onClick={() => onMove(index, index + 1)}
                aria-label={gt("Move {item} down", { item })}
            >
                <ArrowDown/>
            </Button>
        </div>
    );
}
