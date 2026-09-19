import {ToggleGroup, ToggleGroupItem} from "~/lib/client/components/ui/toggle-group";


interface FilterGroupProps {
    title: string;
    selected: number[];
    onChange: (selected: number[]) => void;
    items: {
        id: number;
        name: string;
    }[];
}


export function FilterGroup({ title, selected, items, onChange }: FilterGroupProps) {
    if (!items.length) return null;

    return (
        <div className="flex flex-col gap-3">
            <h2 className="eyebrow">
                {title}
            </h2>
            <ToggleGroup
                spacing={2}
                variant="outline"
                aria-label={title}
                multiple value={selected.map(String)}
                className="flex flex-wrap justify-start"
                onValueChange={values => onChange(values.map(Number))}
            >
                {items.map(item =>
                    <ToggleGroupItem key={item.id} value={String(item.id)}>
                        {item.name}
                    </ToggleGroupItem>
                )}
            </ToggleGroup>
        </div>
    );
}
