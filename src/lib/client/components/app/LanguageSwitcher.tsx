import {useTranslation} from "react-i18next";
import {Globe2} from "lucide-react";
import {cn} from "~/lib/utils/helpers";

export const LanguageSwitcher = ({className}: {className?: string}) => {
    const {i18n, t} = useTranslation();
    return <div className={cn("flex items-center gap-1.5 text-muted-foreground", className)}>
        <Globe2 className="size-3.5" aria-hidden="true"/>
        <select aria-label={t("ui.language")} value={i18n.resolvedLanguage || "en"} onChange={event => void i18n.changeLanguage(event.target.value)} className="cursor-pointer rounded-md bg-transparent py-2 text-xs font-medium text-foreground">
            <option value="en">EN</option><option value="fr">FR</option>
        </select>
    </div>;
};
