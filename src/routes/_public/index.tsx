import {useTranslation} from "react-i18next";
import {Leaf, LockKeyhole} from "lucide-react";
import {createFileRoute} from "@tanstack/react-router";
import {LoginForm} from "~/lib/client/components/app/LoginForm";
import {PageTitle} from "~/lib/client/components/app/PageTitle";
import {RegisterForm} from "~/lib/client/components/app/RegisterForm";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "~/lib/client/components/ui/tabs";

export const Route = createFileRoute("/_public/")({component: HomePage});

function HomePage() {
    const {t} = useTranslation();
    return <PageTitle title={t("ui.family-cookbook")} onlyHelmet>
        <div className="page-enter grid gap-10 py-7 sm:py-10 lg:min-h-[760px] lg:grid-cols-[1.1fr_1fr] lg:gap-20">
            <section className="relative isolate flex min-h-[340px] flex-col justify-end overflow-hidden rounded-[24px] p-7 text-white sm:p-10 lg:min-h-[650px]">
                <img src="/images/family-table.png" alt="" fetchPriority="high" className="absolute inset-0 -z-20 size-full object-cover object-[65%_center]"/>
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/10 to-transparent"/>
                <div className="absolute left-7 top-7 flex items-center gap-2 rounded-full border border-white/40 px-3 py-2 text-[10px] uppercase tracking-[0.16em] sm:left-10 sm:top-10"><Leaf className="size-3.5"/>{t("ui.family-cookbook")}</div>
                <h1 className="max-w-sm font-heading text-5xl leading-[1.06] tracking-[-0.045em] sm:text-6xl">{t("ui.home-title")}</h1>
                <p className="mt-5 max-w-xs text-sm leading-7 text-white/85">{t("ui.home-note")}</p>
                <span className="mt-8 text-[11px] tracking-[0.15em] text-white/70">{t("ui.cover-signature")}</span>
            </section>
            <section className="flex flex-col justify-center py-3 lg:py-10">
                <div className="auth-panel">
                    <p className="eyebrow mb-3">{t("ui.pull-up-chair")}</p>
                    <p className="mb-8 text-sm leading-relaxed text-muted-foreground">{t("ui.login-note")}</p>
                    <Tabs defaultValue="login">
                        <TabsList className="mb-7 w-full">
                            <TabsTrigger value="login">{t("login")}</TabsTrigger>
                            <TabsTrigger value="register">{t("register")}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="login"><LoginForm/></TabsContent>
                        <TabsContent value="register"><RegisterForm/></TabsContent>
                    </Tabs>
                    <p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3.5"/>{t("ui.private-note")}</p>
                </div>
            </section>
        </div>
    </PageTitle>;
}
