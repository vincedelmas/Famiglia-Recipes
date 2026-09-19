import {CookingPot} from "lucide-react";
import {useTranslation} from "react-i18next";
import {ErrorComponent} from "~/lib/client/components/app/ErrorComponent";

export function ErrorCatchBoundary() {
    const {t} = useTranslation();
    return <ErrorComponent title={t("ui.error-title")} text={t("unexpected-error")} icon={<CookingPot/>}/>;
}
