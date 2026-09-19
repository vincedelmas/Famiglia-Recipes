import {useState} from "react";
import {cn} from "~/lib/utils/helpers";
import {useTranslation} from "react-i18next";
import authClient from "~/lib/utils/auth-client";
import {getRouteApi, Link, useLocation, useNavigate, useRouter} from "@tanstack/react-router";
import {useAuth} from "~/lib/client/hooks/use-auth";
import {useQueryClient} from "@tanstack/react-query";
import {Button} from "~/lib/client/components/ui/button";
import {Avatar, AvatarFallback} from "~/lib/client/components/ui/avatar";
import {ArrowUpRight, BookOpen, Leaf, LogOut, Menu, Plus, X} from "lucide-react";
import {LanguageSwitcher} from "~/lib/client/components/app/LanguageSwitcher";

export const Navbar = () => {
    const router = useRouter();
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {currentUser} = useAuth();
    const {pathname} = useLocation();
    const {authOptions} = getRouteApi("__root__").useRouteContext();
    const queryClient = useQueryClient();
    const [menuOpen, setMenuOpen] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const navItems = [
        {name: t("dashboard-nav"), to: "/dashboard", icon: Leaf},
        {name: t("all-recipes-nav"), to: "/all-recipes", icon: BookOpen},
    ] as const;

    const logoutUser = async () => {
        setSigningOut(true);
        try {
            await authClient.signOut();
            queryClient.setQueryData(authOptions.queryKey, null);
            setMenuOpen(false);
            await router.invalidate();
            await navigate({to: "/", replace: true});
            queryClient.removeQueries();
        } finally { setSigningOut(false); }
    };

    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-xl">
            <nav aria-label={t("ui.navigation")} className="mx-auto flex h-20 max-w-[1320px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
                <Link to={currentUser ? "/dashboard" : "/"} className="flex shrink-0 items-center gap-2.5" aria-label="Famiglia">
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground"><Leaf className="size-[19px]" strokeWidth={1.5}/></span>
                    <span className="font-heading text-[28px] tracking-[-0.06em]">famiglia<span className="text-primary">.</span></span>
                </Link>
                {currentUser && <div className="hidden items-center gap-7 md:flex">
                    {navItems.map(item => <Link key={item.to} to={item.to} aria-current={pathname === item.to ? "page" : undefined}
                        className={cn("flex h-20 items-center gap-2 border-b-2 text-sm transition-colors", pathname === item.to ? "border-primary font-medium text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
                        {item.name}
                    </Link>)}
                </div>}
                <div className="flex items-center gap-3 sm:gap-5">
                    <LanguageSwitcher/>
                    {currentUser ? <>
                        <Button className="hidden md:inline-flex" nativeButton={false} render={<Link to="/add-recipe"/>}><Plus data-icon="inline-start"/>{t("add-recipe-nav")}</Button>
                        <div className="hidden items-center gap-2 border-l pl-4 lg:flex">
                            <Avatar><AvatarFallback>{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                            <Button variant="ghost" size="icon" aria-label={t("ui.logout")} title={t("ui.logout")} disabled={signingOut} onClick={logoutUser}><LogOut/></Button>
                        </div>
                        <Button variant="ghost" size="icon" className="lg:hidden" aria-expanded={menuOpen} aria-controls="family-menu" aria-label={t("ui.menu")} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</Button>
                    </> : <span className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">{t("ui.family-cookbook")}<ArrowUpRight className="size-3.5"/></span>}
                </div>
            </nav>
            {currentUser && menuOpen && <div id="family-menu" className="border-t px-5 py-5 lg:hidden">
                <div className="mx-auto flex max-w-xl flex-col gap-2">
                    {[...navItems, {name:t("add-recipe-nav"), to:"/add-recipe" as const, icon:Plus}].map(item => <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className={cn("flex items-center gap-3 rounded-xl p-3 text-sm", pathname === item.to && "bg-accent text-accent-foreground")}><item.icon className="size-4"/>{item.name}</Link>)}
                    <div className="mt-2 flex items-center justify-between border-t pt-4"><span className="text-sm">{currentUser.name}</span><Button variant="ghost" disabled={signingOut} onClick={logoutUser}><LogOut data-icon="inline-start"/>{t("ui.logout")}</Button></div>
                </div>
            </div>}
        </header>
    );
};
