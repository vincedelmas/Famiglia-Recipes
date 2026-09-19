import type React from "react";
import {useTranslation} from "react-i18next";
import {LabelType} from "~/lib/types/types";
import {ToggleGroup, ToggleGroupItem} from "~/lib/client/components/ui/toggle-group";

interface LabelSelectorProps {
    labelsList: LabelType[];
    selectedLabels: string[];
    setSelectedLabels: React.Dispatch<React.SetStateAction<string[]>>;
}

export const LabelSelector = ({labelsList, selectedLabels, setSelectedLabels}: LabelSelectorProps) => {
    const {t} = useTranslation();
    return <ToggleGroup multiple value={selectedLabels} onValueChange={setSelectedLabels} variant="outline" spacing={2} className="flex flex-wrap justify-start" aria-label={t("ui.labels")}>
        {labelsList.map(label => <ToggleGroupItem key={label.name} value={label.name}>{label.name}</ToggleGroupItem>)}
    </ToggleGroup>;
};
