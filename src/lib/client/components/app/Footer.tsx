import {Leaf} from "lucide-react";
import {useTranslation} from "react-i18next";

export const Footer = () => {
    const {t} = useTranslation();
    return <footer className="mt-8 border-t">
        <div className="mx-auto flex max-w-[1320px] flex-col items-center justify-between gap-3 px-5 py-7 text-xs text-muted-foreground sm:flex-row sm:px-8 lg:px-12">
            <span className="flex items-center gap-2"><Leaf className="size-3.5"/>{t("ui.footer")}</span>
            <span>Famiglia · {new Date().getFullYear()}</span>
        </div>
    </footer>;
};
