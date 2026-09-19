import {Minus, Plus} from "lucide-react";
import {useTranslation} from "react-i18next";
import {Button} from "~/lib/client/components/ui/button";

interface ServingsProps {
    servings: number;
    onChange: (servings: number) => void;
}

export const Servings = ({servings, onChange}: ServingsProps) => {
    const {t} = useTranslation();
    return <div className="flex items-center gap-3 rounded-xl border bg-background p-1">
        <Button type="button" variant="ghost" size="icon-sm" aria-label={t("ui.less-servings")} disabled={servings <= 1} onClick={() => onChange(servings - 1)}><Minus/></Button>
        <output className="min-w-5 text-center text-sm font-medium tabular-nums" aria-live="polite">{servings}</output>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={t("ui.more-servings")} onClick={() => onChange(servings + 1)}><Plus/></Button>
    </div>;
};
