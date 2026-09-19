import {BookOpen} from "lucide-react";
import {useTranslation} from "react-i18next";
import {ErrorComponent} from "~/lib/client/components/app/ErrorComponent";

export function NotFound() {
    const {t} = useTranslation();
    return <ErrorComponent title={t("ui.not-found")} text={t("ui.not-found-note")} icon={<BookOpen/>}/>;
}
