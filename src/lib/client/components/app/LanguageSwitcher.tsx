import {Globe2} from "lucide-react";
import {useGT, useLocale, useSetLocale} from "gt-react";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "~/lib/client/components/ui/select";


export const LanguageSwitcher = ({ className }: { className?: string }) => {
    const gt = useGT();
    const locale = useLocale();
    const setLocale = useSetLocale();

    return (
        <Select
            value={locale}
            onValueChange={value => {
                if (value) setLocale(value);
            }}
        >
            <SelectTrigger aria-label={gt("Language")} className={className}>
                <Globe2 aria-hidden="true"/>
                <SelectValue>
                    {value => String(value).toUpperCase()}
                </SelectValue>
            </SelectTrigger>

            <SelectContent align="end" alignItemWithTrigger={false} sideOffset={8}>
                <SelectGroup>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    );
};
