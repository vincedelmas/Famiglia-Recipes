import {Badge} from "~/lib/client/components/ui/badge";
import {MutedText} from "~/lib/client/components/app/MutedText";


interface FilterGroupProps {
    title: string;
    emptyText: string;
    onToggle: (id: number) => void;
    items: {
        id: number;
        name: string;
        color?: string;
    }[];
}


export function FilterGroup({ title, emptyText, items, onToggle }: FilterGroupProps) {
    return (
        <div>
            <div className="text-lg font-semibold mb-1">{title}</div>
            <div className="flex flex-wrap items-center gap-2">
                {items.length === 0 ?
                    <MutedText>{emptyText}</MutedText>
                    :
                    items.map((item) =>
                        <Badge
                            key={item.id}
                            color={item.color}
                            onClick={() => onToggle(item.id)}
                            className={"cursor-pointer rounded-full"}
                        >
                            {item.name}
                        </Badge>
                    )}
            </div>
        </div>
    );
}
