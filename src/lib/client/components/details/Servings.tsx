import {useGT} from "gt-react";
import {Minus, Plus} from "lucide-react";
import {Button} from "~/lib/client/components/ui/button";


interface ServingsProps {
    servings: number;
    onChange: (servings: number) => void;
}


export const Servings = ({ servings, onChange }: ServingsProps) => {
    const gt = useGT();

    return (
        <div className="flex items-center gap-3 rounded-xl border bg-background p-1">
            <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                disabled={servings <= 1}
                aria-label={gt("Fewer servings")}
                onClick={() => onChange(servings - 1)}
            >
                <Minus/>
            </Button>

            <output className="min-w-5 text-center text-sm font-medium tabular-nums" aria-live="polite">
                {servings}
            </output>

            <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label={gt("More servings")}
                onClick={() => onChange(servings + 1)}
            >
                <Plus/>
            </Button>
        </div>
    );
};
