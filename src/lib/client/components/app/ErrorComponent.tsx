import type {ReactNode} from "react";
import {Link} from "@tanstack/react-router";
import {useTranslation} from "react-i18next";
import {ArrowLeft, BookOpen} from "lucide-react";
import {Button} from "~/lib/client/components/ui/button";
import {Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent} from "~/lib/client/components/ui/empty";

interface ErrorComponentProps {title: string; text: string; icon: ReactNode; footerText?: string}

export const ErrorComponent = ({title, text, icon, footerText}: ErrorComponentProps) => {
    const {t} = useTranslation();
    return <Empty className="mx-auto my-16 min-h-80 max-w-xl border">
        <EmptyHeader><EmptyMedia variant="icon">{icon}</EmptyMedia><EmptyTitle>{title}</EmptyTitle><EmptyDescription>{text}</EmptyDescription></EmptyHeader>
        <EmptyContent><div className="flex flex-wrap justify-center gap-3"><Button variant="outline" onClick={() => window.history.back()}><ArrowLeft data-icon="inline-start"/>{t("ui.go-back")}</Button><Button nativeButton={false} render={<Link to="/"/>}><BookOpen data-icon="inline-start"/>{t("take-me-home")}</Button></div>{footerText && <p className="mt-4 text-xs text-muted-foreground">{footerText}</p>}</EmptyContent>
    </Empty>;
};
