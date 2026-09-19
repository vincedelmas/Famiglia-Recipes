import React from "react";
import {useGT} from "gt-react";
import {LabelType} from "~/lib/types/types";
import {ToggleGroup, ToggleGroupItem} from "~/lib/client/components/ui/toggle-group";


interface LabelSelectorProps {
    labelsList: LabelType[];
    selectedLabels: string[];
    setSelectedLabels: React.Dispatch<React.SetStateAction<string[]>>;
}


export const LabelSelector = ({ labelsList, selectedLabels, setSelectedLabels }: LabelSelectorProps) => {
    const gt = useGT();

    return (
        <ToggleGroup
            multiple
            value={selectedLabels}
            variant="outline" spacing={2}
            onValueChange={setSelectedLabels}
            className="flex flex-wrap justify-start"
            aria-label={gt("Recipe categories")}
        >
            {labelsList.map(label =>
                <ToggleGroupItem key={label.name} value={label.name}>
                    {label.name}
                </ToggleGroupItem>
            )}
        </ToggleGroup>
    );
};
