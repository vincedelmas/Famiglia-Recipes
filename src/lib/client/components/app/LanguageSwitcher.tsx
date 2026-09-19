import {useTranslation} from "react-i18next";
import {Globe2} from "lucide-react";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "~/lib/client/components/ui/select";

export const LanguageSwitcher = ({className}: {className?: string}) => {
    const {i18n, t} = useTranslation();
    return <Select value={i18n.resolvedLanguage || "en"} onValueChange={value => { if (value) void i18n.changeLanguage(value); }}>
        <SelectTrigger aria-label={t("ui.language")} className={className}>
            <Globe2 aria-hidden="true"/>
            <SelectValue>{value => String(value).toUpperCase()}</SelectValue>
        </SelectTrigger>
        <SelectContent align="end" alignItemWithTrigger={false} sideOffset={8}>
            <SelectGroup>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
            </SelectGroup>
        </SelectContent>
    </Select>;
};
